   import { tailwindInstaller } from "~/installers/tailwind.js";
 import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { polUiInstaller } from "./polui.js";
  
// Turning this into a const allows the list to be iterated over for programatically creating prompt options
// Should increase extensability in the future
export const availablePackages = [
  "tailwind",
  "pol-ui",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];
 

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName: string;
  scopedAppName: string;
 }

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  };
};

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
 ): PkgInstallerMap => ({
 
 
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
   
  'pol-ui': {
    inUse: packages.includes("pol-ui"),
    installer: polUiInstaller,
   }
  
  
 
});
