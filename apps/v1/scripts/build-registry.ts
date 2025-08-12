import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { availableStyles } from '../registry/config/styles';
import { registry } from '../registry/index';
import { buildColorsRegistry } from './build-colors';

interface RegistryItem {
    name: string;
    type: string;
    description?: string;
    dependencies?: string[];
    registryDependencies?: string[];
    files: Array<{
        path: string;
        content: string;
        type: string;
        target?: string;
    }>;
}

async function buildRegistry() {
    console.log('🏗️  Building registry...');

    // Ensure output directory exists
    const outputDir = join(process.cwd(), 'public/r');
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(join(outputDir, 'styles'), { recursive: true });
    mkdirSync(join(outputDir, 'styles/default'), { recursive: true });
    mkdirSync(join(outputDir, 'colors'), { recursive: true });

    // 1. Build styles index
    writeFileSync(
        join(outputDir, 'styles/index.json'),
        JSON.stringify(availableStyles, null, 2)
    );

    // 2. Build colors registry (simple!)
    await buildColorsRegistry();

    // 3. Build registry components from registry items
    await buildRegistryComponents();

    console.log('✅ Registry built successfully!');
}

async function buildRegistryComponents() {
    for (const item of registry.items) {
        try {
            const registryItem = await buildRegistryItem(item);

            // Write to output
            const outputPath = join(process.cwd(), 'public/r/styles/default', `${item.name}.json`);
            writeFileSync(outputPath, JSON.stringify(registryItem, null, 2));

            console.log(`📦 Built component: ${item.name}`);
        } catch (error) {
            console.error(`❌ Error building ${item.name}:`, error);
        }
    }
}

async function buildRegistryItem(item: any): Promise<RegistryItem> {
    const files = [];

    for (const fileConfig of item.files) {
        let sourcePath: string;
        let content: string;

        if (fileConfig.path.endsWith('.vue')) {
            // Read Vue component from registry directory
            sourcePath = join(process.cwd(), 'registry/default', fileConfig.path);
        } else if (fileConfig.path.endsWith('.scss')) {
            // Read SCSS files from styles directory
            const scssFileName = fileConfig.path.replace('assets/styles/', '');
            sourcePath = join(process.cwd(), 'registry/styles', scssFileName);
        } else {
            // Read TS files from app directory (in main app for utils)
            if (fileConfig.path === 'lib/utils.ts') {
                sourcePath = join(process.cwd(), 'app', fileConfig.path);
            } else {
                sourcePath = join(process.cwd(), 'registry/default', fileConfig.path);
            }
        }

        try {
            content = readFileSync(sourcePath, 'utf-8');
        } catch (error) {
            console.warn(`⚠️  Could not read file: ${sourcePath}`);
            content = `// File not found: ${fileConfig.path}`;
        }

        files.push({
            path: fileConfig.path,
            content,
            type: fileConfig.type,
            target: fileConfig.target || fileConfig.path
        });
    }

    return {
        $schema: "https://meduza-ui.com/schema/registry-item.json",
        ...item,
        files
    };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildRegistry().catch(console.error);
}