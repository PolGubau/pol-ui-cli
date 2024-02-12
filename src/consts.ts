import path from "path";
import { fileURLToPath } from "url";

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");


export const TITLE_TEXT = ` _____   ___  _          _   _ ___ 
 |  _ \\ / _ \\| |        | | | |_ _|
 | |_) | | | | |   _____| | | || | 
 |  __/| |_| | |__|_____| |_| || | 
 |_|    \\___/|_____|     \\___/|___|
                                  `;
export const DEFAULT_APP_NAME = "pol-ui";
export const COMMAND_NAME = "create-pol-ui";
