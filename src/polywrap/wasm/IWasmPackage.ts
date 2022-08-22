import { IWrapPackage } from "../wrap/IWrapPackage";

export interface IWasmPackage extends IWrapPackage {
  getWasmModule(): Promise<Uint8Array | undefined>;
}