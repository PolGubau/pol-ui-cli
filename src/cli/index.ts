import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { COMMAND_NAME, DEFAULT_APP_NAME } from "~/consts.js";
import {
   type AvailablePackages,
 } from "~/installers/index.js";
import { getVersion } from "~/utils/getVersion.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { IsTTYError } from "~/utils/isTTYError.js";
import { logger } from "~/utils/logger.js";
import { validateAppName } from "~/utils/validateAppName.js";
import { validateImportAlias } from "~/utils/validateImportAlias.js";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
  importAlias: string;

  /** @internal Used in CI. */
  CI: boolean;
  
}

interface CliResults {
  appName: string;
  packages: AvailablePackages[];
  flags: CliFlags;
 }

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  packages: ['tailwind'],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    CI: false,
      
    importAlias: "~/",
   },
};

export const runCli = async (): Promise<CliResults> => {
  const cliResults = defaultOptions;

  const program = new Command()
    .name(COMMAND_NAME)
    .description("A CLI for bootstrapping a new app using pol-ui.")
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new t3-app",
      false
  )
    
    
    /** START CI-FLAGS */
    /**
     * @experimental Used for CI E2E tests. If any of the following option-flags are provided, we
     *               skip prompting.
     */
    .option("--CI", "Boolean value if we're running in CI", false)
    /** @experimental - Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      "--tailwind [boolean]",
      "Experimental: Boolean value if we should install Tailwind CSS. Must be used in conjunction with `--CI`.",
      (value) => !!value && value !== "false"
    )
   
    /** @experimental - Used for CI E2E tests. Used in conjunction with `--CI` to skip prompting. */
    .option(
      "-i, --import-alias",
      "Explicitly tell the CLI to use a custom import alias",
      defaultOptions.flags.importAlias
    )
   
    /** END CI-FLAGS */
    .version(getVersion(), "-v, --version", "Display the version number")
    .addHelpText(
      "afterAll",
      `\n Pol-ui was created by ${chalk
        .hex("#E8DCFF")
        .bold(
          "@polgubau"
        )} and has been used to build awesome fullstack applications like ${chalk
        .hex("#b49cff")
        .underline("https://cursosAlbert.com")} \n`
    )
    .parse(process.argv);


  if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
    logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run create-pol-ui with another
  package manager such as pnpm, npm, or Yarn Classic.
  See: https://github.com/polgubau/create-pol-ui/issues/57`);
  }

  // Needs to be separated outside the if statement to correctly infer the type as string | undefined
  const cliProvidedName = program.args[0];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }

  cliResults.flags = program.opts();

  /** @internal Used for CI E2E tests. */
  if (cliResults.flags.CI) {
    cliResults.packages = [];

    // Use always tailwind for now
    cliResults.packages.push("tailwind");
 

    return cliResults;
  }

  if (cliResults.flags.default) {
    return cliResults;
  }

  // Explained below why this is in a try/catch block
  try {
    if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
      logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are 
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal. Alternatively, you 
  can provide the arguments from the CLI directly: https://create.t3.gg/en/installation#experimental-usage to skip the prompts.`);

      throw new IsTTYError("Non-interactive environment");
    }

    // if --CI flag is set, we are running in CI mode and should not prompt the user

    const pkgManager = getUserPkgManager();

    const project = await p.group(
      {
        ...(!cliProvidedName && {
          name: () =>
            p.text({
              message: "What will your project be called?",
              defaultValue: cliProvidedName,
              validate: validateAppName,
            }),
        }),
        language: () => {
          return p.select({
            message: "Will you be using TypeScript or JavaScript?",
            options: [
              { value: "typescript", label: "TypeScript" },
              { value: "javascript", label: "JavaScript" },
            ],
            initialValue: "typescript",
          });
        },
        _: ({ results }) =>
          results.language === "javascript"
            ? p.note(chalk.redBright("Wrong answer, using TypeScript instead"))
            : undefined,
        styling: () => {
          return p.confirm({
            message: "Will you be using Tailwind CSS for styling?",
          });
        },
        trpc: () => {
          return p.confirm({
            message: "Would you like to use tRPC?",
          });
        },
        authentication: () => {
          return p.select({
            message: "What authentication provider would you like to use?",
            options: [
              { value: "none", label: "None" },
              { value: "next-auth", label: "NextAuth.js" },
              // Maybe later
              // { value: "clerk", label: "Clerk" },
            ],
            initialValue: "none",
          });
        },
        database: () => {
          return p.select({
            message: "What database ORM would you like to use?",
            options: [
              { value: "none", label: "None" },
              { value: "prisma", label: "Prisma" },
              { value: "drizzle", label: "Drizzle" },
            ],
            initialValue: "none",
          });
        },
        appRouter: () => {
          return p.confirm({
            message:
              chalk.bgCyan(" EXPERIMENTAL ") +
              " Would you like to use Next.js App Router?",
            initialValue: false,
          });
        },
        databaseProvider: ({ results }) => {
          if (results.database === "none") return;
          return p.select({
            message: "What database provider would you like to use?",
            options: [
              { value: "sqlite", label: "SQLite" },
              { value: "mysql", label: "MySQL" },
              { value: "postgres", label: "PostgreSQL" },
              { value: "planetscale", label: "Planetscale" },
            ],
            initialValue: "sqlite",
          });
        },
        ...(!cliResults.flags.noGit && {
          git: () => {
            return p.confirm({
              message:
                "Should we initialize a Git repository and stage the changes?",
              initialValue: !defaultOptions.flags.noGit,
            });
          },
        }),
        ...(!cliResults.flags.noInstall && {
          install: () => {
            return p.confirm({
              message:
                `Should we run '${pkgManager}` +
                (pkgManager === "yarn" ? `'?` : ` install' for you?`),
              initialValue: !defaultOptions.flags.noInstall,
            });
          },
        }),
        importAlias: () => {
          return p.text({
            message: "What import alias would you like to use?",
            defaultValue: defaultOptions.flags.importAlias,
            placeholder: defaultOptions.flags.importAlias,
            validate: validateImportAlias,
          });
        },
      },
      {
        onCancel() {
          process.exit(1);
        },
      }
    );

    const packages: AvailablePackages[] = [];
    if (project.styling) packages.push("tailwind");
    //  add more packages here if needed

    return {
      appName: project.name ?? cliResults.appName,
      packages,
   
      flags: {
        ...cliResults.flags,
         noGit: !project.git || cliResults.flags.noGit,
        noInstall: !project.install || cliResults.flags.noInstall,
        importAlias: project.importAlias ?? cliResults.flags.importAlias,
      },
    };
  } catch (err) {
    // If the user is not calling create-pol-ui from an interactive terminal, inquirer will throw an IsTTYError
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default t3 app
    if (err instanceof IsTTYError) {
      logger.warn(`
  ${COMMAND_NAME} needs an interactive terminal to provide options`);

      const shouldContinue = await p.confirm({
        message: `Continue scaffolding a default T3 app?`,
        initialValue: true,
      });

      if (!shouldContinue) {
        logger.info("Exiting...");
        process.exit(0);
      }

      logger.info(`Bootstrapping a default T3 app in ./${cliResults.appName}`);
    } else {
      throw err;
    }
  }

  return cliResults;
};
