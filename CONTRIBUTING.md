# Contributing

Thanks for your interest in improving Markory.

This project is a browser bookmark management extension built with `WXT`, `Vue 3` and `TypeScript`.

## Local Setup

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm dev
pnpm dev:firefox
pnpm build
pnpm build:firefox
pnpm zip
pnpm zip:firefox
pnpm compile
```

## What To Check Before Submitting

Please verify the main flows as much as possible:

- Bookmark home page loads normally
- Settings page loads normally
- Search works
- Focus works
- Grouping current window tabs works
- Recycle bin workflow works
- Chinese / English switching works
- Dark / light theme switching works

## Scope That Fits Well

Good contribution areas:

- Better sorting and filtering
- Batch bookmark operations
- Firefox compatibility polish
- UI refinement and accessibility improvements
- Documentation, screenshots and release materials

## Notes

- Keep changes aligned with the current product direction of bookmark organization and tab archiving
- Prefer updating documentation when user-facing behavior changes
- If you add new screenshots for the project homepage, place them under `docs/`
