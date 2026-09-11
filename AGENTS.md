<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Next.js Router Differences

This repository uses a version of Next.js with distinct router behaviors:

- **App Router**: Utilizes React canary releases, incorporating stable React 19 changes and newer features.
- **Pages Router**: Uses the React version specified in the project's `package.json`.

Always verify which router is in use for the specific task and consult the corresponding documentation in `node_modules/next/dist/docs/` for accurate API and convention guidance.

<!-- END:nextjs-agent-rules -->
