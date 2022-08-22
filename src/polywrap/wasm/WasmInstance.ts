import { msgpackEncode, msgpackDecode } from "@polywrap/msgpack-js";
import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import { Err, Ok, Result } from "../../result/Result";
import { WrapExports } from "./types";
import { State } from "./State";
import { createImports } from "./imports";
import { IWrapInstance } from "../wrap/IWrapInstance";

export class WasmInstance implements IWrapInstance {
  public static requiredExports: readonly string[] = ["_wrap_invoke"];

  private classInstanceCount: number = 0;

  constructor(private readonly state: State, private readonly wasmInstance: AsyncWasmInstance) {
    state.wasmInstance = this;
  }

  static async create<TEnv>(wasmModule: Uint8Array, env: TEnv): Promise<IWrapInstance> {
    const state: State = {
      wrapInstances: new Map(),
      classInstances: new Map(),
      invoke: {},
      subinvoke: {
        args: [],
      },
      invokeInstance: {
        args: [],
      },
      subinvokeImplementation: {
        args: [],
      },
      invokeResult: {} as Result<unknown, unknown>,
      className: "",
      classInstancePtr: 0,
      methodName: "",
      args: new Uint8Array(),
      env: msgpackEncode(env),
    };

    const abort = (message: string) => {
      throw "WasmWrapper: Wasm module aborted execution.";
    };

    const memory = AsyncWasmInstance.createMemory({ module: wasmModule });
    const instance: AsyncWasmInstance = await AsyncWasmInstance.createInstance({
      module: wasmModule,
      imports: createImports({
        state,
        memory,
        abort,
      }),
      requiredExports: WasmInstance.requiredExports,
    });

    return new WasmInstance(state, instance);
  }

  async instantiate<TArgs>(className: string, args: TArgs): Promise<Result<number, string>> {
    const argsBuffer = this.parseArgsAndExtractReferences(args);

    const exports = this.wasmInstance.exports as WrapExports;

    this.state.className = className;
    this.state.args = argsBuffer;

    console.log({
      className,
      argsBuffer
    });

    console.log({
      className: this.state.className,
      args: this.state.args
    });

    const result = await exports._wrap_instantiate(
      this.state.className.length,
      this.state.args.byteLength,
    );

    if (result) {
      const resultBuffer = this.state.invoke.result;
      if (!resultBuffer) {
        console.log("instantiate Response undefined");
        return Err("instantiate Response is undefined");
      }
      console.log("instantiate ok");

      return Ok(msgpackDecode(resultBuffer) as number);
    } else {
      console.log("instantiate b", this.state.invoke);
      return Err(this.state.invoke.error);
    }
  }

  async invokeInstance<TArgs, TData>(className: string, classInstancePtr: number, methodName: string, args: TArgs): Promise<Result<TData, string>> {
    const argsBuffer = this.parseArgsAndExtractReferences(args);

    const exports = this.wasmInstance.exports as WrapExports;

    this.state.className = className;
    this.state.classInstancePtr = classInstancePtr;
    this.state.methodName = methodName;
    this.state.args = argsBuffer;

    console.log({
      className,
      classInstancePtr,
      methodName,
      argsBuffer
    });

    console.log({
      className: this.state.className,
      classInstancePtr: this.state.classInstancePtr,
      methodName: this.state.methodName,
      args: this.state.args
    });

    const result = await exports._wrap_invoke_instance(
      this.state.className.length,
      this.state.classInstancePtr,
      this.state.methodName.length,
      this.state.args.byteLength,
    );

    if (result) {
      const resultBuffer = this.state.invoke.result;
      if (!resultBuffer) {
        console.log("invoke instance Response undefined");
        return Err("invoke instance Response is undefined");
      }
      console.log("invoke instance ok");

      return this.decodeResult<TData>(resultBuffer);
    } else {
      console.log("invoke instance b", this.state.invoke);
      return Err(this.state.invoke.error);
    }
  }

  async invokeStatic<TArgs, TData>(className: string, methodName: string, args: TArgs): Promise<Result<TData, string>> {
    const argsBuffer = this.parseArgsAndExtractReferences(args);

    const exports = this.wasmInstance.exports as WrapExports;

    this.state.className = className;
    this.state.methodName = methodName;
    this.state.args = argsBuffer;

    console.log({
      className,
      methodName,
      argsBuffer
    });

    console.log({
      className: this.state.className,
      methodName: this.state.methodName,
      args: this.state.args
    });

    const result = await exports._wrap_invoke(
      this.state.className.length,
      this.state.methodName.length,
      this.state.args.byteLength,
    );

    if (result) {
      const resultBuffer = this.state.invoke.result;
      if (!resultBuffer) {
        console.log("Response undefine");
        return Err("Response is undefined");
      }
      console.log("ok");

      return Ok(msgpackDecode(resultBuffer) as TData);
    } else {
      console.log("b", this.state.invoke);
      return Err(this.state.invoke.error);
    }
  }

  parseArgsAndExtractReferences(args: any): Uint8Array {
    console.log("parseArgsAndExtractReferences", args);
    if (!!args && typeof args === "object" && !Array.isArray(args)) {
      console.log("parseArgsAndExtractReferences match");
      const newObj: any = {};
      let isReference = false;
      console.log("parseArgsAndExtractReferences", Object.keys(args));
      for (const key of Object.keys(args)) {
        console.log("parseArgsAndExtractReferences" + key + " " + typeof args[key] );
        if (args[key] === "__classInstancePtr") {
          isReference = true;
          newObj[key] = args[key];
        } else if(typeof args[key] === "function") {
          isReference = true;
        } else {
          newObj[key] = args[key];
        }
      }

      console.log("MEEEETHODS", getMethods(args));

      if (isReference || getMethods(args).length) {
        console.log("INCREMEEEENT");
        newObj.__wrapInstancePtr = 0; 
        const count = ++this.classInstanceCount;
        newObj.__classInstancePtr = count; 
        console.log("INCREMEEEENT classInstances set", newObj.__classInstancePtr);
        this.state.classInstances.set(count, {
          className: "",
          classInstance: args
        });
        console.log("INCREMEEEENT classInstances get", this.state.classInstances.get(count));

        console.log("parse newObj", newObj);
      }
      const ret = msgpackEncode(newObj);
      console.log("parse newObj2", ret);

      return ret;
    } else {
      console.log("parseArgsAndExtractReferences not a match");
      return msgpackEncode(args);
    }
  }

  decodeResult<TData>(resultBuffer: Uint8Array): Result<TData, string> {
    const resultObj: any = msgpackDecode(resultBuffer);

    if (typeof resultObj === "object" && !Array.isArray(resultObj)) {
      const newObj: any = {};
      let isReference = false;

      console.log("IsReference", resultObj);

      for (const key of Object.keys(resultObj)) {
        if (resultObj[key] === "__classInstancePtr") {
          isReference = true;
        }

        newObj[key] = resultObj[key];
      }

      // if(isReference) {
        newObj.__wrapInstance = this; 
        console.log("decodeResult newObj", newObj);
      // }

      return Ok(newObj as TData);
    } else {
      return Ok(resultObj as TData);
    }
  }
}

function getMethods(obj: any): string[] {
  var res = [];
  for(var m in obj) {
      if(typeof obj[m] == "function") {
          res.push(m)
      }
  }
  return res;
}