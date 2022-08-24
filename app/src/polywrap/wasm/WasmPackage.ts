import { IFileReader } from "../wrap/IFileReader";
import { IWrapInstance } from "../wrap/IWrapInstance";
import { IWrapManifest } from "../wrap/IWrapManifest";
import { IWasmPackage } from "./IWasmPackage";
import { WasmInstance } from "./WasmInstance";

export class WasmPackage implements IWasmPackage {
  constructor(public readonly reader: IFileReader) {
  }

  async getManifest(): Promise<IWrapManifest> {
    return {
      name: "test"
    } as IWrapManifest;
  }

  async getWasmModule(): Promise<Uint8Array | undefined> {
    return await this.reader.getFile("wrap.wasm");
  }

  async createWrapper(): Promise<IWrapInstance> {
    const wasmModule = await this.getWasmModule();

    if(!wasmModule) {
      throw new Error("Wasm module not found");
    }
    
    return await WasmInstance.create(wasmModule, {});
  }
}