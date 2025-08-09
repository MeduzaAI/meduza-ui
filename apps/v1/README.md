# V1 - Meduza UI Registry & Documentation

This is the main application for Meduza UI that serves both as:

- **Documentation site** - Component documentation and usage examples
- **Component registry** - API endpoints serving component metadata

## Structure

```
app/
├── assets/styles/     # SCSS stylesheets
├── components/ui/     # Component source files
├── layouts/           # Nuxt layouts
├── index.vue          # Home page
├── lib/              # Utility functions
└── app.vue           # Root app component

content/docs/         # Documentation content (Nuxt Content)
public/r/            # Generated registry JSON files
scripts/             # Build scripts
```

## Development

```bash
# Start dev server
pnpm dev

# Build application
pnpm build

# Build component registry
pnpm build:registry
```

## Technology Stack

- **Nuxt 4** - Full-stack Vue framework
- **@nuxt/content** - File-based CMS for documentation
- **SCSS** - Enhanced CSS with variables and mixins
- **TypeScript** - Type safety
- **Vue 3** - Reactive frontend framework