import { IPackageLoader } from "../../polywrap/loader/IPackageLoader";
import { IWrapInstance } from "../../polywrap/wrap/IWrapInstance";
import { IWrapPackage } from "../../polywrap/wrap/IWrapPackage";
import { IEthereumSigner, IEthereumSignerArgs, EthereumSigner } from "./EthereumSigner";

export class EthereumSigner__factory {
  private static __uri: string = "wrap://ethereum.eth";
  private static __className: string = "EthereumSigner";

  static async fromUri(uri: string, loader: IPackageLoader, arg: IEthereumSignerArgs): Promise<IEthereumSigner> {
    const wrapPackage: IWrapPackage = await loader.load(uri);
    
    return EthereumSigner__factory.fromPackage(wrapPackage, arg);
  }

  static async fromPackage(wrapPackage: IWrapPackage, arg: IEthereumSignerArgs): Promise<IEthereumSigner> {
    const wrapper: IWrapInstance = await wrapPackage.createWrapper();

    return EthereumSigner__factory.fromWrapper(wrapper, arg);
  }

  static async fromWrapper(wrapper: IWrapInstance, arg: IEthereumSignerArgs): Promise<IEthereumSigner> {
    const result = await wrapper.instantiate<IEthereumSignerArgs>(EthereumSigner__factory.__className, arg);

    if (!result.ok) {
      throw result.error;
    }

    return new EthereumSigner(wrapper, result.value);
  }
}
