import * as fs from 'fs';
import * as path from 'path';
import { availableStyles } from '../registry/config/styles';
import { availableColors, colorValues } from '../registry/config/colors';

interface RegistryItem {
    $schema?: string;
    name: string;
    type: string;
    description?: string;
    dependencies?: string[];
    registryDependencies?: string[];
    files: Array<{
        path: string;
        content: string;
        type: string;
        target: string;
    }>;
    cssVars?: Record<string, Record<string, string>>;
    scssVars?: Record<string, string>;
}

async function buildRegistry() {
    console.log('🏗️  Building registry...');

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public/r');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'styles'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'styles/default'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'colors'), { recursive: true });

    // 1. Build styles index
    fs.writeFileSync(
        path.join(outputDir, 'styles/index.json'),
        JSON.stringify(availableStyles, null, 2)
    );
    console.log('✓ Built styles index');

    // 2. Build colors index
    fs.writeFileSync(
        path.join(outputDir, 'colors/index.json'),
        JSON.stringify(availableColors, null, 2)
    );
    console.log('✓ Built colors index');

    // 3. Build individual color files
    Object.entries(colorValues).forEach(([colorName, colors]) => {
        const colorData = {
            cssVars: {
                light: {
                    "primary": colors["700"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "primary-foreground": colors["50"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "secondary": colors["100"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "secondary-foreground": colors["900"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "muted": colors["100"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "muted-foreground": colors["500"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "border": colors["200"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "input": colors["200"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%'
                },
                dark: {
                    "primary": colors["200"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "primary-foreground": colors["900"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "secondary": colors["800"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "secondary-foreground": colors["200"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "muted": colors["800"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "muted-foreground": colors["400"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "border": colors["700"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%',
                    "input": colors["700"].replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(' ') + '%'
                }
            },
            scssVars: Object.fromEntries(
                Object.entries(colors).map(([key, value]) => [`$${colorName}-${key}`, value])
            )
        };

        fs.writeFileSync(
            path.join(outputDir, 'colors', `${colorName}.json`),
            JSON.stringify(colorData, null, 2)
        );
    });
    console.log('✓ Built color files');

    // 4. Build registry components
    await buildRegistryComponents();

    console.log('✅ Registry built successfully!');
}

async function buildRegistryComponents() {
    // Build base style system (index)
    const indexItem: RegistryItem = {
        $schema: "https://meduza-ui.com/schema/registry-item.json",
        name: "index",
        type: "registry:style",
        description: "Base style system with SCSS variables and mixins",
        dependencies: [],
        registryDependencies: ["utils"],
        files: [
            {
                path: "assets/styles/_variables.scss",
                content: fs.readFileSync(path.join(process.cwd(), 'registry/styles/_variables.scss'), 'utf-8'),
                type: "registry:style",
                target: "assets/styles/_variables.scss"
            },
            {
                path: "assets/styles/_mixins.scss",
                content: fs.readFileSync(path.join(process.cwd(), 'registry/styles/_mixins.scss'), 'utf-8'),
                type: "registry:style",
                target: "assets/styles/_mixins.scss"
            }
        ],
        cssVars: {
            light: {
                "primary-color": "#334155",
                "primary-foreground-color": "#f8fafc",
                "secondary-color": "#f1f5f9",
                "secondary-foreground-color": "#0f172a",
                "background-color": "#ffffff",
                "foreground-color": "#0f172a",
                "border-color": "#e2e8f0"
            },
            dark: {
                "primary-color": "#e2e8f0",
                "primary-foreground-color": "#0f172a",
                "secondary-color": "#1e293b",
                "secondary-foreground-color": "#f8fafc",
                "background-color": "#0f172a",
                "foreground-color": "#f8fafc",
                "border-color": "#334155"
            }
        }
    };

    fs.writeFileSync(
        path.join(process.cwd(), 'public/r/styles/default/index.json'),
        JSON.stringify(indexItem, null, 2)
    );
    console.log('✓ Built index style');

    // Build utils
    const utilsItem: RegistryItem = {
        $schema: "https://meduza-ui.com/schema/registry-item.json",
        name: "utils",
        type: "registry:lib",
        description: "BEM className utility for Vue components",
        dependencies: [],
        files: [
            {
                path: "lib/utils.ts",
                content: readFileSync(join(process.cwd(), 'registry/default/lib/utils.ts'), 'utf-8'),
                type: "registry:lib",
                target: "lib/utils.ts"
            }
        ]
    };

    writeFileSync(
        join(process.cwd(), 'public/r/styles/default/utils.json'),
        JSON.stringify(utilsItem, null, 2)
    );
    console.log('✓ Built utils');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildRegistry().catch(console.error);
}
