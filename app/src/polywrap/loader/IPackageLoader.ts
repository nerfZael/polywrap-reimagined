import { IWrapPackage } from "../wrap/IWrapPackage";

export interface IPackageLoader {
  load(packagePath: string): Promise<IWrapPackage>
}