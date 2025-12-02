# Project Instructions

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS v4 with CSS variables
- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React

## Project Structure

```
src/
|-- components/      # Higher-order components built with shadcn/ui
|   |-- ui/          # shadcn/ui primitive components
|-- lib/             # Utility functions
|   |-- utils.ts     # cn() helper and other utilities
|-- assets/          # Static assets
|-- App.tsx          # Main application component
```

## Key Development Conventions

### 1. Styling Guidelines

- **AVOID** hardcoded Tailwind classes like `bg-blue-500`, `text-red-600`
- **PREFER** CSS variables and semantic classes:
  - `bg-primary`, `bg-secondary`, `bg-destructive`
  - `text-foreground`, `text-muted-foreground`
  - `border`, `ring`, `accent`
- This ensures consistent theming and easier style maintenance

### 2. Component Architecture

- **Higher-order components**: Place in `./src/components/`
  - These should primarily compose shadcn/ui primitives
  - Follow shadcn patterns for props and styling
- **UI primitives**: Located in `./src/components/ui/`
  - These are shadcn/ui components installed via CLI
  - Do not modify these directly unless absolutely necessary

### 3. Adding New shadcn Components

When you need a shadcn component that's not yet installed:

```bash
npx shadcn@latest add <component-name>
```

Example: `npx shadcn@latest add dialog`

### 4. TypeScript Requirements

- Always run type checking after significant changes:
  ```bash
  npm run typecheck
  ```
- Fix all type errors before considering work complete
- Use proper TypeScript types, avoid `any` unless absolutely necessary

### 5. Import Aliases

The project uses `@/` as an alias for `./src/`:

- `@/components` -> `./src/components`
- `@/lib/utils` -> `./src/lib/utils`
- `@/components/ui` -> `./src/components/ui`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript compiler for type checking

## Component Creation Workflow

1. Check if needed shadcn component exists: `npx shadcn@latest add <component>`
2. Create higher-order component in `src/components/`
3. Use shadcn primitives from `src/components/ui/`
4. Apply styling using CSS variables (bg-primary, text-foreground, etc.)
5. Run `npm run typecheck` to ensure no type errors

## Common CSS Variables (defined in src/index.css)

- **Backgrounds**: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`
- **Borders**: `border`, `input`, `ring`
- **Text**: `primary-foreground`, `secondary-foreground`, `muted-foreground`
- **Radius**: `radius` (for border-radius consistency)

## Best Practices

1. Always check existing components before creating new ones
2. Maintain consistency with existing code patterns
3. Use the `cn()` utility from `@/lib/utils` for conditional classes
4. Follow React 19 best practices and hooks rules
5. Keep components small, focused, and reusable
6. Document complex component props with TypeScript interfaces

## Testing & Validation

Before considering any feature complete:

1. Run `npm run typecheck` - must pass with no errors
2. Run `npm run lint` - fix any linting issues

