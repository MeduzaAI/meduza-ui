import fetch from "node-fetch";
import fs from "fs-extra";
import {
  type RegistryBaseColor,
  registryBaseColorSchema,
  type RegistryIndex,
  registryIndexSchema,
  type RegistryItem,
  registryItemSchema,
} from "./schema";

export async function fetchRegistryIndex(
  registryUrl: string,
): Promise<RegistryIndex> {
  const response = await fetch(`${registryUrl}/styles/index.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch registry index: ${response.statusText}`);
  }

  const json = await response.json();

  // Validate the response
  const result = registryIndexSchema.safeParse(json);
  if (!result.success) {
    throw new Error("Invalid registry index format");
  }

  return result.data;
}

export async function fetchRegistryItem(
  registryUrl: string,
  name: string,
): Promise<RegistryItem> {
  const response = await fetch(`${registryUrl}/styles/default/${name}.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch component ${name}: ${response.statusText}`,
    );
  }

  const json = await response.json();
  return registryItemSchema.parse(json);
}

export async function fetchColorData(
  baseColor: string,
  registryUrl: string,
): Promise<RegistryBaseColor> {
  const response = await fetch(`${registryUrl}/colors/${baseColor}.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch color data for ${baseColor}: ${response.statusText}`,
    );
  }

  const json = await response.json();
  return registryBaseColorSchema.parse(json);
}

export function getAvailableColors() {
  return [
    { name: "slate", label: "Slate" },
    { name: "zinc", label: "Zinc" },
    { name: "stone", label: "Stone" },
    { name: "gray", label: "Gray" },
    { name: "neutral", label: "Neutral" },
  ];
}

export async function validateComponentExists(
  registryUrl: string,
  componentName: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${registryUrl}/styles/default/${componentName}.json`,
      {
        method: "HEAD", // Only check if it exists
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function searchComponents(
  registryUrl: string,
  query: string,
): Promise<RegistryIndex> {
  const index = await fetchRegistryIndex(registryUrl);

  return index.filter(
    (component) =>
      component.name.toLowerCase().includes(query.toLowerCase()) ||
      (component.description &&
        component.description.toLowerCase().includes(query.toLowerCase())),
  );
}

export async function injectColorsIntoVariablesFile(
  variablesPath: string,
  colorData: RegistryBaseColor,
) {
  // Read the existing variables file (created by registry)
  if (!(await fs.pathExists(variablesPath))) {
    throw new Error(
      `Variables file not found at ${variablesPath}. Please run init first.`,
    );
  }

  let content = await fs.readFile(variablesPath, "utf8");

  // Replace the color variables in :root section
  const lightVars = Object.entries(colorData.cssVars.light)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n");

  const darkVars = Object.entries(colorData.cssVars.dark)
    .map(([key, value]) => `    --${key}: ${value};`)
    .join("\n");

  // Replace light mode colors in :root
  const rootRegex = /:root\s*\{([\s\S]*?)\}/;
  const rootMatch = content.match(rootRegex);

  if (rootMatch) {
    const rootContent = rootMatch[1];

    // Replace semantic color variables (keep other variables intact)
    const updatedRootContent = rootContent.replace(
      /(\/\* Colors - Semantic \*\/[\s\S]*?)(\n\s*\/\* Surface colors \*\/)/,
      `/* Colors - Semantic */\n${lightVars}$2`,
    );

    content = content.replace(rootRegex, `:root {${updatedRootContent}}`);
  }

  // Replace dark mode colors in [data-theme="dark"]
  const darkRegex = /\[data-theme="dark"\]\s*\{([\s\S]*?)\}/;
  const darkMatch = content.match(darkRegex);

  if (darkMatch) {
    const darkContent = darkMatch[1];

    // Replace semantic color variables (keep other variables intact)
    const updatedDarkContent = darkContent.replace(
      /([\s\S]*?)(--background-color)/,
      `${darkVars}\n\n    $2`,
    );

    content = content.replace(
      darkRegex,
      `[data-theme="dark"] {${updatedDarkContent}}`,
    );
  }

  // Write the updated content back
  await fs.writeFile(variablesPath, content, "utf8");
}
