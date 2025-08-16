/**
 * @name utils
 * @description BEM className utility for Vue components
 * @type registry:lib
 * @dependencies []
 */

// Types for simplified BEM className utility
interface UseClassNameReturn {
    b: () => string;
    e: (element: string, condition?: boolean) => string;
    em: (element: string, modifier: string, condition?: boolean) => string;
    m: (modifier: string, condition?: boolean) => string;
}

export function useClassName(block: string): UseClassNameReturn {
    return {
        // Block: returns the base block name
        b: (): string => block,

        // Element: returns block__element (conditional if condition provided)
        e: (element: string, condition?: boolean): string => {
            if (condition === false) return '';
            return `${block}__${element}`;
        },

        // Element with modifier: returns block__element--modifier (conditional if condition provided)
        em: (element: string, modifier: string, condition?: boolean): string => {
            if (condition === false) return '';
            return `${block}__${element}--${modifier}`;
        },

        // Modifier: returns block--modifier (conditional if condition provided)
        m: (modifier: string, condition?: boolean): string => {
            if (condition === false) return '';
            return `${block}--${modifier}`;
        }
    };
}
