# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-conference website system that generates static sites for various GitNation conferences. Each conference has its own configuration and assets, but shares common components and build tooling.

## Conference-based Architecture

The codebase is organized around individual conferences, each identified by a unique key (e.g., `c3`, `jsn`, `mlconf`, `qaconf`). Each conference lives in `src/conferences/$key/` and has:

- **Templates**: Conference-specific HTML templates in `src/conferences/$key/templates/`  
- **Styles**: SCSS files in `src/conferences/$key/sass/`
- **Assets**: Images, fonts, icons in respective folders
- **Configuration**: Conference settings in `conference-settings.js`

## Development Commands

### Starting Development Server
Use conference-specific start commands:
```bash
yarn start:$key  # Replace $key with conference code
```

Examples:
- `yarn start:c3` - Start C3 conference
- `yarn start:jsn` - Start JS Nation conference  
- `yarn start:mlconf` - Start ML conference

Generic development with mock data:
```bash
yarn dev  # Starts with mock data enabled
```

### Building for Production
```bash
yarn build:$key  # Build specific conference
yarn build-all-brands  # Build all conferences (for CI)
```

The build output goes to `build/$key/` directory.

### Testing
```bash
yarn test:watch     # Run Jest in watch mode
yarn test:smoke     # Run smoke tests
yarn test:build     # Run gulp snapshot tests on build output
```

### Linting
```bash
yarn lint          # Run ESLint
yarn lint-fix      # Auto-fix linting issues
```

## Shared Components

Common functionality is located in:

- **`src/partials/`** - Reusable HTML components (speakers, sponsors, schedules, etc.)
- **`src/components/`** - JavaScript utilities and interactive components
- **`gulp/`** - Build system tasks and configuration

Each conference symlinks to shared partials for consistency.

## Build System

The project uses Gulp as the primary build tool with:

- **Nunjucks** for HTML templating
- **SASS** preprocessing with PostCSS
- **Webpack** for JavaScript bundling
- **Snapshot testing** for HTML output validation

The build is configured via `CONF_CODE` environment variable to target specific conferences.

## Key Files

- **`gulp/config.js`** - Main build configuration, sets paths based on CONF_CODE
- **`package.json`** - Contains conference-specific scripts and dependencies  
- **`gulpfile.js`** - Loads all Gulp tasks from `gulp/tasks/`
- **`jest.config.js`** - Test configuration for Jest

## Working with a Conference

1. Identify the conference key from the README or `package.json` scripts
2. Use conference-specific commands (e.g., `yarn start:jsn`)
3. Edit files in `src/conferences/$key/` for conference-specific changes
4. Modify `src/partials/` for shared component updates
5. Test with `yarn test:build` before committing