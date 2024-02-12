import { envVariablesInstaller } from "~/installers/envVars.js";
import { nextAuthInstaller } from "~/installers/nextAuth.js";
import { prismaInstaller } from "~/installers/prisma.js";
import { tailwindInstaller } from "~/installers/tailwind.js";
 import { type PackageManager } from "~/utils/getUserPkgManager.js";
  
// Turning this into a const allows the list to be iterated over for programatically creating prompt options
// Should increase extensability in the future
export const availablePackages = [
  "tailwind",   
] as const;
export type AvailablePackages = (typeof availablePackages)[number];
 

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  appRouter?: boolean;
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
  // nextAuth: {
  //   inUse: packages.includes("nextAuth"),
  //   installer: nextAuthInstaller,
  // },
 
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  
  
 
});
