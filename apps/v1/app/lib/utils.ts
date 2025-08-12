/**
 * @name utils
 * @description BEM className utility for Vue components
 * @type registry:lib
 * @dependencies []
 */

// Types for BEM className utility
type BemModifiers = Record<string, boolean>;

interface BemClassNameOptions {
    prefix?: string;
    separator?: {
        element?: string;
        modifier?: string;
    };
}

interface BemElement {
    m: (modifiers: string | string[] | BemModifiers) => string;
}

interface BemBlock {
    (modifiers?: string | string[] | BemModifiers): string;
    e: (element: string) => BemElement;
    m: (modifiers: string | string[] | BemModifiers) => string;
}

interface UseClassNameReturn {
    b: BemBlock;
    e: (element: string) => BemElement;
    m: (modifiers: string | string[] | BemModifiers) => string;
}

export function useClassName(block: string, options?: BemClassNameOptions): UseClassNameReturn {
    const config = {
        prefix: '',
        separator: {
            element: '__',
            modifier: '--',
        },
        ...options,
    };

    const getBlockName = (): string => {
        return config.prefix ? `${config.prefix}-${block}` : block;
    };

    const generateModifiers = (
        base: string,
        modifiers: string | string[] | BemModifiers
    ): string[] => {
        const classes = [base];

        if (typeof modifiers === 'string') {
            classes.push(`${base}${config.separator.modifier}${modifiers}`);
        } else if (Array.isArray(modifiers)) {
            modifiers.forEach(mod => {
                classes.push(`${base}${config.separator.modifier}${mod}`);
            });
        } else if (modifiers && typeof modifiers === 'object') {
            Object.entries(modifiers).forEach(([key, value]) => {
                if (value) {
                    classes.push(`${base}${config.separator.modifier}${key}`);
                }
            });
        }

        return classes;
    };

    const b: BemBlock = ((modifiers?: string | string[] | BemModifiers) => {
        const blockName = getBlockName();

        if (!modifiers) {
            return blockName;
        }

        return generateModifiers(blockName, modifiers).join(' ');
    }) as BemBlock;

    const e = (element: string): BemElement => {
        const elementName = `${getBlockName()}${config.separator.element}${element}`;

        return {
            m: (modifiers: string | string[] | BemModifiers): string => {
                return generateModifiers(elementName, modifiers).join(' ');
            },
        };
    };

    const m = (modifiers: string | string[] | BemModifiers): string => {
        return generateModifiers(getBlockName(), modifiers).join(' ');
    };

    // Add element and modifier methods to block function
    b.e = e;
    b.m = m;

    return { b, e, m };
}

// Simple utility for combining classes
export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
    const result: string[] = [];

    for (const cls of classes) {
        if (!cls) continue;

        if (typeof cls === 'string') {
            result.push(cls);
        } else if (typeof cls === 'object') {
            for (const [key, value] of Object.entries(cls)) {
                if (value) {
                    result.push(key);
                }
            }
        }
    }

    return result.join(' ');
}
