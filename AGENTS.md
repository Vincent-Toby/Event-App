<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Project workflow rules

- shadcn/ui in this project is the BASE UI version. NEVER use `asChild`. Use the `render` prop instead.
- NEVER open, read, print, cat, grep, or otherwise expose `.env` or any `.env*` file, directly or through a terminal command.
- Do NOT edit: lib/auth.ts, lib/auth-client.ts, lib/prisma.ts, app/api/auth/[...all]/route.ts, prisma/, prisma7.config.ts, lib/generated/, or any .env* file, unless the task explicitly says to.
- Do NOT run git commit or git push. Do NOT run database or prisma commands. Do NOT add dependencies the task doesn't name.
- Do only the task in the message, then stop. No extra features, no refactors.
- If anything is unexpected (missing file, a command fails twice, an error you can't trace to this task), STOP and report instead of improvising.
- When done, report: files created/changed/deleted, and the exact command output requested.

<!-- END:nextjs-agent-rules -->
