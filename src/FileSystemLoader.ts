import { EmbeddedPackage } from "./polywrap/embedded/EmbeddedPackage";
import { IPackageLoader } from "./polywrap/loader/IPackageLoader";
import { IWrapPackage } from "./polywrap/wrap/IWrapPackage";

import fs from "fs";

export class FileSystemLoader implements IPackageLoader {
  async load(packagePath: string): Promise<IWrapPackage> {
    const manifestBuffer = await fs.promises.readFile(`${packagePath}/wrap.info`);
    const moduleBuffer = await fs.promises.readFile(`${packagePath}/wrap.wasm`);

    return new EmbeddedPackage(manifestBuffer, moduleBuffer);
  }
}