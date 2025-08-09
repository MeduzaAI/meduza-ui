export interface MeduzaConfig {
  framework: FrameworkType;
  typescript: boolean;
  style: string;
  bemPrefix: string;
  spacing: {
    unit: 'px';
    base: number;
  };
  aliases: {
    components: string;
    ui: string;
    utils: string;
    composables: string;
  };
  scss: {
    variables: string;
    mixins: string;
    components: string;
  };
}

export enum FrameworkType {
  VITE = 'vite',
  NUXT = 'nuxt',
  QUASAR = 'quasar',
  UNKNOWN = 'unknown',
}

export enum PackageManagerType {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
  BUN = 'bun',
}

export interface VueProjectInfo {
  framework: FrameworkType;
  typescript: boolean;
  packageManager: PackageManagerType;
  vueVersion?: string;
  packageJson: Record<string, unknown>;
  rootPath: string;
}

export interface RegistryItem {
  name: string;
  description: string;
  version: string;
  type: 'component' | 'utility' | 'style';
  framework: FrameworkType[];
  dependencies: string[];
  files: RegistryFile[];
}

export interface RegistryFile {
  path: string;
  content: string;
  type: 'vue' | 'ts' | 'scss' | 'json';
}
