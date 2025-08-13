import { Command } from "commander";
import { z } from "zod";
import fs from "fs-extra";
import * as path from "path";
import prompts from "prompts";
import kleur from "kleur";

import { getProjectInfo, type ProjectInfo } from "@/utils/get-project-info";
import { getConfig, writeConfig, resolveConfigPaths } from "@/utils/get-config";
import { logger } from "@/utils/logger";
import { handleError } from "@/utils/handle-error";
import { addComponents } from "@/utils/add-components";
import {
  getAvailableColors,
  fetchColorData,
  createVariablesFile,
  createMixinsFile,
} from "@/registry/api";
import {
  type Config,
  type RawConfig,
  DEFAULT_REGISTRIES,
} from "@/registry/schema";

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
  srcDir: z.boolean().optional(),
  style: z.string().default("default"),
  baseColor: z.string().optional(),
});

export const init = new Command()
  .name("init")
  .description("initialize your Vue.js project and install base styles")
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-d, --defaults", "use default configuration.", false)
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd(),
  )
  .option("-s, --silent", "mute output.", false)
  .option(
    "--src-dir",
    "use the src directory when creating a new project.",
    false,
  )
  .option(
    "--no-src-dir",
    "do not use the src directory when creating a new project.",
  )
  .option("--style <style>", "the style to use. (default)", "default")
  .option(
    "--base-color <base-color>",
    "the base color to use. (slate, gray, zinc, neutral, stone)",
    undefined,
  )
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        ...opts,
      });

      await runInit(options);
    } catch (error) {
      handleError(error);
    }
  });

export async function runInit(options: z.infer<typeof initOptionsSchema>) {
  const projectInfo = await getProjectInfo(options.cwd);

  if (!projectInfo || projectInfo.framework === "manual") {
    logger.error(
      "Could not detect a Vue.js project. Please run this command in a Vue.js project directory.",
    );
    process.exit(1);
  }

  if (!options.silent) {
    logger.info(`Detected ${kleur.cyan(projectInfo.framework)} project.`);
  }

  // Check for existing configuration
  const existingConfig = await getConfig(options.cwd);

  if (existingConfig && !options.force) {
    logger.warn("Configuration file already exists. Use --force to overwrite.");
    process.exit(1);
  }

  // Prompt for configuration
  let config: RawConfig;
  if (options.defaults) {
    config = getDefaultConfig(projectInfo, options);
  } else {
    config = await promptForConfig(projectInfo, options);
  }

  // Confirm configuration
  if (!options.yes && !options.silent) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: `Write configuration to ${kleur.cyan("meduza.config.json")}. Proceed?`,
      initial: true,
    });

    if (!proceed) {
      process.exit(0);
    }
  }

  // Write configuration
  if (!options.silent) {
    logger.spin("Writing configuration...");
  }
  await writeConfig(options.cwd, config);
  if (!options.silent) {
    logger.stopSpinner(true, "Configuration written.");
  }

  // Install base components
  const resolvedConfig = await resolveConfigPaths(options.cwd, config);
  await installBaseComponents(resolvedConfig, options);

  // Inject selected color variables
  await injectColorVariables(
    config.baseColor || "slate",
    resolvedConfig,
    options,
  );

  // Add main.scss import to project entry file
  await addMainScssImport(projectInfo, resolvedConfig, options);

  if (!options.silent) {
    logger.success("Project initialized successfully!");
    logger.break();
    logger.info("Next steps:");
    logger.info("1. Start adding components:");
    logger.info("   " + kleur.cyan("npx meduza-ui add button"));
    logger.break();
    logger.info(
      "2. The main.scss file has been automatically imported in your project",
    );
  }
}

async function promptForConfig(
  projectInfo: ProjectInfo,
  options: z.infer<typeof initOptionsSchema>,
): Promise<RawConfig> {
  const colors = getAvailableColors();

  const responses = await prompts([
    {
      type: "select",
      name: "style",
      message: "Which style would you like to use?",
      choices: [
        {
          title: "Default",
          value: "default",
          description: "A clean, minimal design system",
        },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "baseColor",
      message: "Which base color would you like to use?",
      choices: colors.map((color) => ({
        title: color.label,
        value: color.name,
        description: `Use ${color.label.toLowerCase()} as the base color`,
      })),
      initial: 0,
    },
    {
      type: "text",
      name: "scssVariables",
      message: "Where would you like to store your SCSS variables?",
      initial: projectInfo.baseDir
        ? `${projectInfo.baseDir}/assets/styles/_variables.scss`
        : "assets/styles/_variables.scss",
    },
    {
      type: "text",
      name: "scssMixins",
      message: "Where would you like to store your SCSS mixins?",
      initial: projectInfo.baseDir
        ? `${projectInfo.baseDir}/assets/styles/_mixins.scss`
        : "assets/styles/_mixins.scss",
    },
    {
      type: "text",
      name: "scssMain",
      message: "Where would you like to store your SCSS main file?",
      initial: projectInfo.baseDir
        ? `${projectInfo.baseDir}/assets/styles/main.scss`
        : "assets/styles/main.scss",
    },
    {
      type: "text",
      name: "components",
      message: "Configure the import alias for components:",
      initial: "@/components",
    },
    {
      type: "text",
      name: "composables",
      message: "Configure the import alias for composables:",
      initial: "@/composables",
    },
    {
      type: "text",
      name: "utils",
      message: "Configure the import alias for utils:",
      initial: "@/lib/utils",
    },
  ]);

  const aliasPrefix = projectInfo.aliasPrefix;

  return {
    $schema: "https://meduza-ui.com/schema.json",
    style: responses.style,
    baseColor: responses.baseColor,
    scss: {
      variables: responses.scssVariables,
      mixins: responses.scssMixins,
      main: responses.scssMain,
    },
    aliases: {
      components: responses.components,
      ui: `${responses.components}/ui`,
      lib: `${aliasPrefix}/lib`,
      utils: responses.utils,
      composables: responses.composables,
      assets: `${aliasPrefix}/assets`,
      styles: `${aliasPrefix}/assets/styles`,
    },
    framework: {
      type: projectInfo.framework,
    },
    registries: DEFAULT_REGISTRIES,
  };
}

function getDefaultConfig(
  projectInfo: ProjectInfo,
  options: z.infer<typeof initOptionsSchema>,
): RawConfig {
  const baseDir = projectInfo.baseDir;
  const aliasPrefix = projectInfo.aliasPrefix;

  return {
    $schema: "https://meduza-ui.com/schema.json",
    style: options.style,
    baseColor: options.baseColor || "slate",
    scss: {
      variables: baseDir
        ? path.join(baseDir, "assets/styles/_variables.scss")
        : "assets/styles/_variables.scss",
      mixins: baseDir
        ? path.join(baseDir, "assets/styles/_mixins.scss")
        : "assets/styles/_mixins.scss",
      main: baseDir
        ? path.join(baseDir, "assets/styles/main.scss")
        : "assets/styles/main.scss",
    },
    aliases: {
      components: `${aliasPrefix}/components`,
      ui: `${aliasPrefix}/components/ui`,
      lib: `${aliasPrefix}/lib`,
      utils: `${aliasPrefix}/lib/utils`,
      composables: `${aliasPrefix}/composables`,
      assets: `${aliasPrefix}/assets`,
      styles: `${aliasPrefix}/assets/styles`,
    },
    framework: {
      type: projectInfo.framework,
    },
    registries: DEFAULT_REGISTRIES,
  };
}

async function installBaseComponents(
  config: Config,
  options: z.infer<typeof initOptionsSchema>,
) {
  // Install base utilities and styles
  const baseComponents = [
    "utils", // useClassName utility and cn helper
    "index", // Base style configuration with theme variables
  ];

  await addComponents(baseComponents, config, {
    overwrite: true,
    silent: options.silent,
    isInit: true,
  });
}

async function injectColorVariables(
  baseColor: string,
  config: Config,
  options: z.infer<typeof initOptionsSchema>,
) {
  if (!options.silent) {
    logger.spin(`Injecting ${baseColor} color variables...`);
  }

  try {
    // Fetch color data from registry
    const registryConfig = config.registries?.["meduza-ui"];
    if (!registryConfig) {
      throw new Error("No meduza-ui registry configured");
    }
    const registryUrl =
      typeof registryConfig === "string" ? registryConfig : registryConfig.url;
    const baseUrl = registryUrl
      .replace("/{name}.json", "")
      .replace("{name}", "");
    const colorData = await fetchColorData(baseColor, baseUrl);

    // Create variables file with selected colors
    await createVariablesFile(config.resolvedPaths.scssVariables, colorData);

    // Create mixins file
    await createMixinsFile(config.resolvedPaths.scssMixins);

    if (!options.silent) {
      logger.stopSpinner(true, `Injected ${baseColor} color variables.`);
    }
  } catch (error) {
    if (!options.silent) {
      logger.stopSpinner(false, `Failed to inject color variables.`);
    }
    throw error;
  }
}

async function addMainScssImport(
  projectInfo: ProjectInfo,
  config: Config,
  options: z.infer<typeof initOptionsSchema>,
) {
  if (!options.silent) {
    logger.spin("Adding main.scss import...");
  }

  try {
    // Handle Nuxt projects differently - they use nuxt.config.ts for CSS imports
    if (projectInfo.framework === "nuxt") {
      await addNuxtScssImport(config, options);
      return;
    }

    // Find the main entry file (main.js, main.ts, etc.) for Vue projects
    const possibleMainFiles = [
      "src/main.js",
      "src/main.ts",
      "main.js",
      "main.ts",
    ];

    let mainFilePath: string | null = null;
    for (const file of possibleMainFiles) {
      if (await fs.pathExists(file)) {
        mainFilePath = file;
        break;
      }
    }

    if (!mainFilePath) {
      if (!options.silent) {
        logger.warn("Could not find main entry file to add SCSS import");
      }
      return;
    }

    // Read the current content
    const content = await fs.readFile(mainFilePath, "utf8");

    // Check if the import already exists
    const mainScssPath = config.resolvedPaths.scssMain;
    const relativePath = path.relative(
      path.dirname(mainFilePath),
      mainScssPath,
    );
    const importStatement = `import '${relativePath.startsWith(".") ? relativePath : "./" + relativePath}'`;

    if (content.includes(importStatement) || content.includes("main.scss")) {
      if (!options.silent) {
        logger.stopSpinner(true, "Main SCSS import already exists");
      }
      return;
    }

    // Add the import at the top after other imports
    const lines = content.split("\n");
    let insertIndex = 0;

    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("import ")) {
        insertIndex = i + 1;
      }
    }

    // Insert the SCSS import
    lines.splice(insertIndex, 0, importStatement);

    // Write back to file
    await fs.writeFile(mainFilePath, lines.join("\n"));

    if (!options.silent) {
      logger.stopSpinner(true, `Added main.scss import to ${mainFilePath}`);
    }
  } catch (error) {
    if (!options.silent) {
      logger.stopSpinner(false, "Failed to add main.scss import");
    }
    throw error;
  }
}

async function addNuxtScssImport(
  config: Config,
  options: z.infer<typeof initOptionsSchema>,
) {
  const nuxtConfigFiles = ["nuxt.config.ts", "nuxt.config.js"];
  let configPath: string | null = null;

  // Find the Nuxt config file
  for (const file of nuxtConfigFiles) {
    if (await fs.pathExists(file)) {
      configPath = file;
      break;
    }
  }

  if (!configPath) {
    if (!options.silent) {
      logger.warn("Could not find nuxt.config.ts to add SCSS import");
    }
    return;
  }

  // Read the current config
  const content = await fs.readFile(configPath, "utf8");

  // Get the relative path to main.scss from the config file
  const mainScssPath = config.resolvedPaths.scssMain;
  const relativePath = path.relative(process.cwd(), mainScssPath);

  // Check if CSS import already exists
  if (content.includes(relativePath) || content.includes("main.scss")) {
    if (!options.silent) {
      logger.stopSpinner(
        true,
        "Main SCSS import already exists in nuxt.config",
      );
    }
    return;
  }

  // Add the CSS import to nuxt.config
  let updatedContent = content;

  // Look for existing css array
  if (content.includes("css:")) {
    // Add to existing css array
    const cssRegex = /css:\s*\[([\s\S]*?)\]/;
    const match = content.match(cssRegex);
    if (match) {
      const existingCss = match[1].trim();
      const newCssArray = existingCss
        ? `${existingCss},\n    '${relativePath}'`
        : `'${relativePath}'`;
      updatedContent = content.replace(
        cssRegex,
        `css: [\n    ${newCssArray}\n  ]`,
      );
    }
  } else {
    // Add new css property to the config
    const configRegex = /(export\s+default\s+defineNuxtConfig\s*\(\s*\{)/;
    if (configRegex.test(content)) {
      updatedContent = content.replace(
        configRegex,
        `$1\n  css: ['${relativePath}'],`,
      );
    }
  }

  // Write back to file
  await fs.writeFile(configPath, updatedContent);

  if (!options.silent) {
    logger.stopSpinner(true, `Added main.scss import to ${configPath}`);
  }
}
