 


export enum PackageManagers{
  npm = "npm",
  pnpm = "pnpm",
  yarn = "yarn",
  bun = "bun",
}
export type PackageManager = keyof typeof PackageManagers;

export const getUserPkgManager=(): PackageManager  => {
  // This environment variable is set by npm and yarn but pnpm seems less consistent
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith(PackageManagers.yarn)) {
      return PackageManagers.yarn;
    } else if (userAgent.startsWith(PackageManagers.pnpm)) {
      return PackageManagers.pnpm;
    } else if (userAgent.startsWith(PackageManagers.bun)) {
      return PackageManagers.bun;
    } else {
      return PackageManagers.npm;
    }
  } else {
    // If no user agent is set, assume npm
    return PackageManagers.npm;
  }
};
