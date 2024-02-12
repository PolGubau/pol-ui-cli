import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import {  type Installer } from "~/installers/index.js";

export const envVariablesInstaller: Installer = ({
  projectDir,
    projectName,
}) => {
 

 
  const envContent = getEnvContent(
    
    projectName
  );

  let envFile = "";
   

  if (envFile !== "") {
    const envSchemaSrc = path.join(
      PKG_ROOT,
      "template/extras/src/env",
      envFile
    );
    const envFileText = fs.readFileSync(envSchemaSrc, "utf-8");
    const envSchemaDest = path.join(projectDir, "src/env.js");
    fs.writeFileSync(
      envSchemaDest, envFileText,
      "utf-8"
    );
  }

  const envDest = path.join(projectDir, ".env");
  const envExampleDest = path.join(projectDir, ".env.example");

  fs.writeFileSync(envDest, envContent, "utf-8");
  fs.writeFileSync(envExampleDest, exampleEnvContent + envContent, "utf-8");
};

const getEnvContent = (
 
   projectName: string
) => {
  let content = `

# Environment variables for ${projectName}
# When adding additional environment variables, the schema in "/src/env.js"
# should be updated accordingly.
`
    .trim()
    .concat("\n");

 
 
 
  return content;
};

const exampleEnvContent = `
# Since the ".env" file is gitignored, you can use the ".env.example" file to
# build a new ".env" file when you clone the repo. Keep this file up-to-date
# when you add new variables to \`.env\`.

# This file will be committed to version control, so make sure not to have any
# secrets in it. If you are cloning this repo, create a copy of this file named
# ".env" and populate it with your secrets.
`
  .trim()
  .concat("\n\n");
