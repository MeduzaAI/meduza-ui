# Framework Detection Specification

## Overview

Comprehensive framework detection system for the meduza-ui CLI to identify Vue.js project types and
configure components accordingly.

## Supported Frameworks

### Primary Frameworks

1. **Vite + Vue 3** - Modern build tool with Vue 3
2. **Nuxt 3** - Full-stack Vue framework
3. **Quasar** - Vue framework with material design
4. **Vue CLI** - Legacy Vue tooling (limited support)

### Framework Detection Logic

```typescript
// utils/get-vue-project-info.ts
export interface VueProjectInfo {
  framework: VueFramework;
  version: string;
  hasTypeScript: boolean;
  hasSrcDir: boolean;
  vueVersion: string;
  packageManager: PackageManager;
  configFiles: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export enum VueFramework {
  Vite = 'vite',
  Nuxt = 'nuxt',
  Quasar = 'quasar',
  VueCLI = 'vue-cli',
  Manual = 'manual',
}

export enum PackageManager {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
  bun = 'bun',
}
```

## Detection Methods

### 1. Configuration File Detection

```typescript
// Primary detection method - config files
const FRAMEWORK_CONFIG_PATTERNS = {
  [VueFramework.Nuxt]: ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'],
  [VueFramework.Vite]: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'],
  [VueFramework.Quasar]: ['quasar.config.js', 'quasar.config.ts'],
  [VueFramework.VueCLI]: ['vue.config.js', 'vue.config.ts'],
};

async function detectByConfigFiles(cwd: string): Promise<VueFramework | null> {
  for (const [framework, patterns] of Object.entries(FRAMEWORK_CONFIG_PATTERNS)) {
    for (const pattern of patterns) {
      if (await fs.pathExists(path.join(cwd, pattern))) {
        return framework as VueFramework;
      }
    }
  }
  return null;
}
```

### 2. Package.json Dependencies Detection

```typescript
// Secondary detection method - dependencies
const FRAMEWORK_DEPENDENCY_PATTERNS = {
  [VueFramework.Nuxt]: ['nuxt', '@nuxt/kit', 'nuxt3'],
  [VueFramework.Vite]: ['vite', '@vitejs/plugin-vue'],
  [VueFramework.Quasar]: ['quasar', '@quasar/cli', '@quasar/vite-plugin'],
  [VueFramework.VueCLI]: ['@vue/cli-service', '@vue/cli-plugin-typescript'],
};

async function detectByDependencies(packageJson: any): Promise<VueFramework | null> {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const [framework, deps] of Object.entries(FRAMEWORK_DEPENDENCY_PATTERNS)) {
    if (deps.some(dep => allDeps[dep])) {
      return framework as VueFramework;
    }
  }
  return null;
}
```

### 3. Directory Structure Detection

```typescript
// Tertiary detection method - directory patterns
const FRAMEWORK_DIRECTORY_PATTERNS = {
  [VueFramework.Nuxt]: ['pages', 'layouts', 'middleware', 'plugins', 'server'],
  [VueFramework.Quasar]: ['src-electron', 'src-capacitor', 'src-cordova'],
};

async function detectByDirectoryStructure(cwd: string): Promise<VueFramework | null> {
  for (const [framework, dirs] of Object.entries(FRAMEWORK_DIRECTORY_PATTERNS)) {
    const hasRequiredDirs = await Promise.all(dirs.map(dir => fs.pathExists(path.join(cwd, dir))));

    if (hasRequiredDirs.some(exists => exists)) {
      return framework as VueFramework;
    }
  }
  return null;
}
```

## Comprehensive Detection Function

```typescript
// Main detection function
export async function getVueProjectInfo(cwd: string): Promise<VueProjectInfo> {
  const packageJsonPath = path.join(cwd, 'package.json');

  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error('No package.json found. Not a valid Node.js project.');
  }

  const packageJson = await fs.readJson(packageJsonPath);

  // Validate Vue project
  if (!isVueProject(packageJson)) {
    throw new Error('Vue.js not detected in dependencies. This is not a Vue project.');
  }

  // Detect framework (priority order)
  let framework =
    (await detectByConfigFiles(cwd)) ||
    (await detectByDependencies(packageJson)) ||
    (await detectByDirectoryStructure(cwd)) ||
    VueFramework.Manual;

  // Get additional info
  const [hasTypeScript, hasSrcDir, vueVersion, packageManager, configFiles] = await Promise.all([
    detectTypeScript(cwd),
    detectSrcDirectory(cwd),
    getVueVersion(packageJson),
    detectPackageManager(cwd),
    findConfigFiles(cwd),
  ]);

  return {
    framework,
    version: getFrameworkVersion(packageJson, framework),
    hasTypeScript,
    hasSrcDir,
    vueVersion,
    packageManager,
    configFiles,
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
  };
}
```

## Framework-Specific Validation

### Vue Project Validation

```typescript
function isVueProject(packageJson: any): boolean {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Must have Vue 3
  if (allDeps.vue && !allDeps.vue.startsWith('^3.')) {
    throw new Error('Only Vue 3 is supported. Please upgrade to Vue 3.');
  }

  // Check for Vue presence
  return !!(allDeps.vue || allDeps['@vue/runtime-core']);
}

function getVueVersion(packageJson: any): string {
  const vue = packageJson.dependencies?.vue || packageJson.devDependencies?.vue;
  if (!vue) return 'unknown';

  // Extract version number
  const match = vue.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : vue;
}
```

### TypeScript Detection

```typescript
async function detectTypeScript(cwd: string): Promise<boolean> {
  // Check for tsconfig.json
  if (await fs.pathExists(path.join(cwd, 'tsconfig.json'))) {
    return true;
  }

  // Check for TypeScript files
  const tsFiles = await fg.glob('**/*.{ts,tsx}', {
    cwd,
    ignore: ['node_modules/**', 'dist/**'],
    deep: 2,
  });

  return tsFiles.length > 0;
}
```

### Package Manager Detection

```typescript
async function detectPackageManager(cwd: string): Promise<PackageManager> {
  // Check for lock files
  if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return PackageManager.pnpm;
  }

  if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
    return PackageManager.yarn;
  }

  if (await fs.pathExists(path.join(cwd, 'bun.lockb'))) {
    return PackageManager.bun;
  }

  // Default to npm
  return PackageManager.npm;
}
```

## Framework-Specific Configuration

### Vite Configuration

```typescript
// framework-adapters/vite.ts
export class ViteAdapter implements FrameworkAdapter {
  async configure(config: Config, projectInfo: VueProjectInfo): Promise<void> {
    const viteConfigPath = this.findViteConfig(config.resolvedPaths.cwd);

    if (!viteConfigPath) {
      await this.createViteConfig(config, projectInfo);
    } else {
      await this.updateViteConfig(viteConfigPath, config);
    }
  }

  private async updateViteConfig(configPath: string, config: Config): Promise<void> {
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Parse and update Vite config
    const updatedConfig = this.addAliases(configContent, config.aliases);
    const finalConfig = this.addScssSupport(updatedConfig);

    await fs.writeFile(configPath, finalConfig);
  }

  private addAliases(configContent: string, aliases: Config['aliases']): string {
    // Add path aliases to Vite config
    const aliasConfig = Object.entries(aliases)
      .map(([key, value]) => `'${key}': '${value}'`)
      .join(',\n      ');

    return configContent.replace(
      /resolve:\s*{([^}]*)}/,
      `resolve: {
    alias: {
      ${aliasConfig}
    }
  }`
    );
  }

  private addScssSupport(configContent: string): string {
    // Add SCSS preprocessing
    return configContent.replace(
      /css:\s*{([^}]*)}/,
      `css: {
    preprocessorOptions: {
      scss: {
        additionalData: \`
          @import "@/styles/_functions.scss";
          @import "@/styles/_mixins.scss";
          @import "@/styles/_tokens.scss";
        \`
      }
    }
  }`
    );
  }
}
```

### Nuxt Configuration

```typescript
// framework-adapters/nuxt.ts
export class NuxtAdapter implements FrameworkAdapter {
  async configure(config: Config, projectInfo: VueProjectInfo): Promise<void> {
    const nuxtConfigPath = this.findNuxtConfig(config.resolvedPaths.cwd);

    if (nuxtConfigPath) {
      await this.updateNuxtConfig(nuxtConfigPath, config);
    }
  }

  private async updateNuxtConfig(configPath: string, config: Config): Promise<void> {
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Update Nuxt config for meduza-ui
    const updatedConfig = this.addComponents(configContent, config);
    const finalConfig = this.addScssSupport(updatedConfig, config);

    await fs.writeFile(configPath, finalConfig);
  }

  private addComponents(configContent: string, config: Config): string {
    // Add component auto-imports
    return configContent.replace(
      /components:\s*{([^}]*)}/,
      `components: {
    dirs: [
      '${config.aliases.components}',
      '${config.aliases.ui}'
    ]
  }`
    );
  }

  private addScssSupport(configContent: string, config: Config): string {
    // Add SCSS configuration
    return configContent.replace(
      /css:\s*\[([^\]]*)\]/,
      `css: ['${config.scss.variables}', '${config.scss.mixins}']`
    );
  }
}
```

### Quasar Configuration

```typescript
// framework-adapters/quasar.ts
export class QuasarAdapter implements FrameworkAdapter {
  async configure(config: Config, projectInfo: VueProjectInfo): Promise<void> {
    const quasarConfigPath = path.join(config.resolvedPaths.cwd, 'quasar.config.js');

    if (await fs.pathExists(quasarConfigPath)) {
      await this.updateQuasarConfig(quasarConfigPath, config);
    }
  }

  private async updateQuasarConfig(configPath: string, config: Config): Promise<void> {
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Update Quasar config
    const updatedConfig = this.addSassVariables(configContent, config);

    await fs.writeFile(configPath, updatedConfig);
  }

  private addSassVariables(configContent: string, config: Config): string {
    // Add SCSS variables to Quasar
    return configContent.replace(
      /css:\s*\[([^\]]*)\]/,
      `css: [
    '${config.scss.variables}',
    '${config.scss.mixins}',
    'app.scss'
  ]`
    );
  }
}
```

## Framework Adapter Interface

```typescript
// framework-adapters/base.ts
export interface FrameworkAdapter {
  configure(config: Config, projectInfo: VueProjectInfo): Promise<void>;
  validateCompatibility(projectInfo: VueProjectInfo): Promise<boolean>;
  getDefaultPaths(projectInfo: VueProjectInfo): Partial<Config['aliases']>;
  getRecommendedDependencies(): string[];
}

export class FrameworkAdapterFactory {
  static create(framework: VueFramework): FrameworkAdapter {
    switch (framework) {
      case VueFramework.Vite:
        return new ViteAdapter();
      case VueFramework.Nuxt:
        return new NuxtAdapter();
      case VueFramework.Quasar:
        return new QuasarAdapter();
      case VueFramework.VueCLI:
        return new VueCLIAdapter();
      default:
        return new ManualAdapter();
    }
  }
}
```

## Error Handling and Validation

```typescript
// Validation functions
export class FrameworkValidator {
  static async validateVueVersion(projectInfo: VueProjectInfo): Promise<void> {
    const majorVersion = parseInt(projectInfo.vueVersion.split('.')[0]);

    if (majorVersion < 3) {
      throw new Error(
        `Vue ${projectInfo.vueVersion} is not supported. ` + 'Meduza UI requires Vue 3.0 or higher.'
      );
    }
  }

  static async validateFrameworkCompatibility(
    framework: VueFramework,
    projectInfo: VueProjectInfo
  ): Promise<void> {
    switch (framework) {
      case VueFramework.Nuxt:
        await this.validateNuxtVersion(projectInfo);
        break;
      case VueFramework.Quasar:
        await this.validateQuasarVersion(projectInfo);
        break;
      case VueFramework.VueCLI:
        this.warnVueCLIDeprecation();
        break;
    }
  }

  private static async validateNuxtVersion(projectInfo: VueProjectInfo): Promise<void> {
    const nuxtVersion = projectInfo.dependencies.nuxt || projectInfo.devDependencies.nuxt;

    if (nuxtVersion && !nuxtVersion.includes('3.')) {
      throw new Error(
        'Nuxt 2 is not supported. Please upgrade to Nuxt 3 for Meduza UI compatibility.'
      );
    }
  }

  private static warnVueCLIDeprecation(): void {
    console.warn(
      'Vue CLI is in maintenance mode. Consider migrating to Vite for better performance.'
    );
  }
}
```

## Testing Framework Detection

```typescript
// tests/framework-detection.test.ts
describe('Framework Detection', () => {
  describe('Vite Detection', () => {
    it('should detect Vite by config file', async () => {
      const tempDir = await createTempProject({
        'vite.config.ts': 'export default {}',
      });

      const info = await getVueProjectInfo(tempDir);
      expect(info.framework).toBe(VueFramework.Vite);
    });

    it('should detect Vite by dependencies', async () => {
      const tempDir = await createTempProject({
        'package.json': JSON.stringify({
          devDependencies: {
            vite: '^4.0.0',
            '@vitejs/plugin-vue': '^4.0.0',
          },
        }),
      });

      const info = await getVueProjectInfo(tempDir);
      expect(info.framework).toBe(VueFramework.Vite);
    });
  });

  describe('Nuxt Detection', () => {
    it('should detect Nuxt 3 by config file', async () => {
      const tempDir = await createTempProject({
        'nuxt.config.ts': 'export default defineNuxtConfig({})',
      });

      const info = await getVueProjectInfo(tempDir);
      expect(info.framework).toBe(VueFramework.Nuxt);
    });
  });

  describe('TypeScript Detection', () => {
    it('should detect TypeScript by tsconfig.json', async () => {
      const tempDir = await createTempProject({
        'tsconfig.json': '{}',
        'package.json': JSON.stringify({ dependencies: { vue: '^3.0.0' } }),
      });

      const info = await getVueProjectInfo(tempDir);
      expect(info.hasTypeScript).toBe(true);
    });
  });
});
```

This framework detection system provides comprehensive identification of Vue.js project types and
ensures proper configuration for each supported framework.
