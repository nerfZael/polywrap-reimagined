import { IPackageLoader } from "../../polywrap/loader/IPackageLoader";
import { IWrapInstance } from "../../polywrap/wrap/IWrapInstance";
import { IWrapPackage } from "../../polywrap/wrap/IWrapPackage";
import { IEthereumProvider, IEthereumProviderArgs, EthereumProvider } from "./EthereumProvider";

export class EthereumProvider__factory {
  private static __uri: string = "wrap://ethereum.eth";
  private static __className: string = "EthereumProvider";

  static async fromUri(uri: string, loader: IPackageLoader, arg: IEthereumProviderArgs): Promise<IEthereumProvider> {
    const wrapPackage: IWrapPackage = await loader.load(uri);
    
    return EthereumProvider__factory.fromPackage(wrapPackage, arg);
  }

  static async fromPackage(wrapPackage: IWrapPackage, arg: IEthereumProviderArgs): Promise<IEthereumProvider> {
    const wrapper: IWrapInstance = await wrapPackage.createWrapper();

    return EthereumProvider__factory.fromWrapper(wrapper, arg);
  }

  static async fromWrapper(wrapper: IWrapInstance, arg: IEthereumProviderArgs): Promise<IEthereumProvider> {
    const result = await wrapper.instantiate<IEthereumProviderArgs>(EthereumProvider__factory.__className, arg);

    if (!result.ok) {
      throw result.error;
    }

    return new EthereumProvider(wrapper, result.value);
  }
}
