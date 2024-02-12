import { execSync } from "child_process";
import https from "https";

import { getVersion } from "./getVersion.js";
import { logger } from "./logger.js";

export const renderVersionWarning = (npmVersion: string) => {
  const currentVersion = getVersion();

    console.log("🟣 Current version:", currentVersion);
    console.log("🟣 NPM version:", npmVersion);

  
  if (currentVersion === npmVersion) {
    logger.success("  You are using the latest version of create-pol-ui.");
  } else if (currentVersion.includes("beta")) {
    logger.warn("  You are using a beta version of pol-ui.");
    logger.warn("  Please report any bugs you encounter.");
  } else if (currentVersion.includes("next")) {
    logger.warn(
      "  You are running create-pol-ui with the @next tag which is no longer maintained."
    );
    logger.warn("  Please run the CLI with @latest instead.");
  } else if (currentVersion !== npmVersion) {
    logger.warn("  You are using an outdated version of create-pol-ui.");
    logger.warn(
      "  Your version:",
      currentVersion + ".",
      "Latest version in the npm registry:",
      npmVersion
    );
    logger.warn("  Please run the CLI with @latest to get the latest updates.");
  }
  console.log("");
};
 
interface DistTagsBody {
  latest: string;
}

function checkForLatestVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://registry.npmjs.org/-/package/create-pol-ui/dist-tags",
        (res) => {
          if (res.statusCode === 200) {
            let body = "";
            res.on("data", (data) => (body += data));
            res.on("end", () => {
              resolve((JSON.parse(body) as DistTagsBody).latest);
            });
          } else {
            reject(new Error("Unable to fetch latest version."));
          }
        }
      )
      .on("error", () => {
        logger.error("Unable to check for latest version.");
        reject(new Error("Unable to check for latest version."));
      });
  });
}

export const getNpmVersion = () =>
  // Always trying to `fetch` the registy before the `npm view` command because the fetch call is faster
  
  checkForLatestVersion().catch(() => {
    try {
      return execSync("npm view create-pol-ui version").toString().trim();
    } catch {
      return null;
    }
  });
