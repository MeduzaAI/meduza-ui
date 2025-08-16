import { Command } from "commander";
import { z } from "zod";
import * as path from "path";
import prompts from "prompts";
import kleur from "kleur";

import { getConfig } from "@/utils/get-config";
import { getProjectInfo } from "@/utils/get-project-info";
import { logger } from "@/utils/logger";
import { handleError } from "@/utils/handle-error";
import {
  getAvailableColors,
  fetchColorData,
  injectColorsIntoVariablesFile,
} from "@/registry/api";
import { Config } from "@/registry/schema";

const themeOptionsSchema = z.object({
  cwd: z.string(),
  color: z.string().optional(),
  name: z.string().optional(),
  force: z.boolean(),
  silent: z.boolean(),
  list: z.boolean(),
  root: z.boolean(),
});

export const theme = new Command()
  .name("theme")
  .description("add themed colors to your project")
  .argument("[color]", "themed color name to add")
  .option("-n, --name <name>", "custom name for the theme in your project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd(),
  )
  .option("-f, --force", "overwrite existing theme.", false)
  .option("-s, --silent", "mute output.", false)
  .option("-l, --list", "list available themed colors.", false)
  .option("--root", "save as root theme (overrides existing variables)", false)
  .action(async (colorArg, opts) => {
    try {
      const options = themeOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        color: colorArg,
        ...opts,
      });

      await runTheme(options);
    } catch (error) {
      handleError(error);
    }
  });

export async function runTheme(options: z.infer<typeof themeOptionsSchema>) {
  // Check if project is initialized
  const config = await getConfig(options.cwd);

  if (!config) {
    logger.error("No configuration found. Please run the init command first:");
    logger.info("  " + kleur.cyan("npx meduza-ui init"));
    process.exit(1);
  }

  const projectInfo = await getProjectInfo(options.cwd);

  if (!projectInfo) {
    logger.error(
      "Could not detect a Vue.js project. Please run this command in a Vue.js project directory.",
    );
    process.exit(1);
  }

  // Handle list flag
  if (options.list) {
    await listAvailableThemedColors(config);
    return;
  }

  // Determine themed color to install
  let selectedColor: string;
  let themeName: string;

  if (options.color) {
    selectedColor = options.color;
    themeName = options.name || options.color;
  } else {
    const selection = await promptForThemedColor(config);
    selectedColor = selection.color;
    themeName = selection.name;
  }

  // Validate theme name
  if (!isValidThemeName(themeName)) {
    logger.error(
      `Invalid theme name: ${themeName}. Theme names must be kebab-case.`,
    );
    process.exit(1);
  }

  // Check for root theme warning
  if (options.root && !options.force) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: kleur.yellow(
        "⚠️  Root theme will override existing variables. Continue?",
      ),
      initial: false,
    });

    if (!proceed) {
      process.exit(0);
    }
  }

  if (!options.silent) {
    logger.info(
      `Adding ${kleur.cyan(selectedColor)} theme as ${kleur.cyan(themeName)}...`,
    );
  }

  // Add themed color
  await addThemedColor(selectedColor, themeName, config, options);

  if (!options.silent) {
    logger.success(`Successfully added ${kleur.cyan(themeName)} theme!`);
    logger.break();

    if (options.root) {
      logger.info("Theme applied as root theme (overrides default variables).");
    } else {
      logger.info("To use this theme, add the data attribute to your app:");
      logger.info(`  ${kleur.cyan(`<html data-theme="${themeName}">`)}`);
      logger.info("  or");
      logger.info(`  ${kleur.cyan(`<body data-theme="${themeName}">`)}`);
    }

    logger.break();
    logger.info("Theme integration options:");
    logger.info(`• ${kleur.cyan("Static theme")}: Set data-theme in HTML`);
    logger.info(
      `• ${kleur.cyan("Dynamic switching")}: Use JavaScript to change data-theme`,
    );
    logger.info(
      `• ${kleur.cyan("User preference")}: Store selection in localStorage`,
    );
  }
}

async function promptForThemedColor(
  config: Config,
): Promise<{ color: string; name: string }> {
  const registryConfig = config.registries?.["meduza-ui"];
  const registryUrl =
    typeof registryConfig === "string" ? registryConfig : registryConfig?.url;
  const colors = (await getAvailableColors(registryUrl)) as Array<{
    name: string;
    label: string;
  }>;
  const themedColors = colors.filter((color: { name: string; label: string }) =>
    color.name.includes("-"),
  ); // Themed colors have hyphens

  if (themedColors.length === 0) {
    logger.error("No themed colors found in registry.");
    process.exit(1);
  }

  // Interactive color selection
  const { selectedColor } = await prompts({
    type: "select",
    name: "selectedColor",
    message: "Which themed color would you like to add?",
    choices: themedColors.map((color: { name: string; label: string }) => ({
      title: color.label,
      value: color.name,
      description: `Add ${color.label} themed color scheme`,
    })),
  });

  if (!selectedColor) {
    logger.warn("No themed color selected. Exiting.");
    process.exit(1);
  }

  // Prompt for custom theme name
  const { customName } = await prompts({
    type: "text",
    name: "customName",
    message:
      "Enter a custom name for this theme (or press enter to use default):",
    initial: selectedColor,
    validate: (value: string) => {
      if (!value.trim()) return "Theme name cannot be empty";
      if (!isValidThemeName(value))
        return "Theme name must be kebab-case (e.g., my-theme)";
      return true;
    },
  });

  return {
    color: selectedColor,
    name: customName || selectedColor,
  };
}

async function listAvailableThemedColors(config: any) {
  const registryConfig = config.registries?.["meduza-ui"];
  const registryUrl =
    typeof registryConfig === "string" ? registryConfig : registryConfig?.url;
  const colors = (await getAvailableColors(registryUrl)) as Array<{
    name: string;
    label: string;
  }>;
  const themedColors = colors.filter((color: { name: string; label: string }) =>
    color.name.includes("-"),
  ); // Filter for themed colors

  logger.break();
  logger.info(kleur.bold("Available themed colors:"));
  logger.break();

  themedColors.forEach(
    (color: { name: string; label: string }, index: number) => {
      logger.info(
        `${kleur.cyan((index + 1).toString().padStart(2))}. ${kleur.bold(color.label)}`,
      );
      logger.info(`    ${kleur.dim(`ID: ${color.name}`)}`);
      logger.break();
    },
  );

  logger.info(
    `Use ${kleur.cyan("npx meduza-ui theme <color-name>")} to add a themed color.`,
  );
}

async function addThemedColor(
  colorName: string,
  themeName: string,
  config: Config,
  options: z.infer<typeof themeOptionsSchema>,
) {
  const spinner = options.silent
    ? null
    : logger.spin(`Installing ${colorName} themed color...`);

  try {
    // Fetch color data
    const registryConfig = config.registries?.["meduza-ui"];
    if (!registryConfig) {
      throw new Error("No meduza-ui registry configured");
    }

    const registryUrl =
      typeof registryConfig === "string" ? registryConfig : registryConfig.url;
    const baseUrl = registryUrl
      .replace("/{name}.json", "")
      .replace("{name}", "");
    const colorData = await fetchColorData(colorName, baseUrl);

    // Inject color into variables file
    const variablesPath = path.resolve(
      config.resolvedPaths.styles,
      "_variables.scss",
    );
    await injectColorsIntoVariablesFile(variablesPath, colorData, {
      asTheme: !options.root,
      themeName: options.root ? undefined : themeName,
    });

    if (!options.silent) {
      logger.stopSpinner(true, `Installed ${colorName} themed color.`);
    }
  } catch (error) {
    if (!options.silent) {
      logger.stopSpinner(false, `Failed to install ${colorName} themed color.`);
    }
    throw error;
  }
}

function isValidThemeName(name: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name) && name.length <= 50;
}
