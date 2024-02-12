import gradient from "gradient-string";

import { TITLE_TEXT } from "~/consts.js";
import { PackageManager, PackageManagers, getUserPkgManager } from "~/utils/getUserPkgManager.js";

 const colors = [
  "#add7ff",
  "#89ddff",
  "#C3B6EA",
  "#fae4fc",
  "#d0679d",
  "#A28CE5",
];
 export const renderTitle = () => {
  const t3Gradient = gradient(colors);

  // resolves weird behavior where the ascii is offset
  const pkgManager:PackageManager = getUserPkgManager();
  if (pkgManager === PackageManagers.yarn || pkgManager ===  PackageManagers.pnpm) {
    console.log("");
  }
  console.log(t3Gradient.multiline(TITLE_TEXT));
};


 