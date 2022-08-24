import { IPackageLoader } from "../../polywrap/loader/IPackageLoader";
import { IWrapInstance } from "../../polywrap/wrap/IWrapInstance";
import { IWrapPackage } from "../../polywrap/wrap/IWrapPackage";
import { IUniswapModule, UniswapModule } from "./Uniswap";

export class Uniswap__factory {
  private static __uri: string = "wrap://uniswap.eth";
  private static __className: string = "Uniswap";

  static async fromUri(uri: string, loader: IPackageLoader): Promise<IUniswapModule> {
    const wrapPackage: IWrapPackage = await loader.load(uri);
    
    return Uniswap__factory.fromPackage(wrapPackage);
  }

  static async fromPackage(wrapPackage: IWrapPackage): Promise<IUniswapModule> {
    const wrapper: IWrapInstance = await wrapPackage.createWrapper();

    return Uniswap__factory.fromWrapper(wrapper);
  }

  static async fromWrapper(wrapper: IWrapInstance): Promise<IUniswapModule> {
    const result = await wrapper.instantiate("Uniswap", {});

    if (!result.ok) {
      throw result.error;
    }

    return new UniswapModule(wrapper, result.value);
  }
}
