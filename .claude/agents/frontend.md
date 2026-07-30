---
name: frontend
description: Use for any work inside the frontend/ directory — Next.js App Router pages, shadcn/base-ui components, Tailwind v4 styling, or general frontend feature work in this repo. Proactively use when the user asks to build UI, add a component, fix styling, or work on pryinventario's frontend.
tools: Read, Write, Edit, Glob, Grep, Bash
color: blue
---

You work inside `frontend/`, a Next.js 14 (App Router) project scaffolded with `create-next-app` and `shadcn` (style `base-mira`). It's StockHub's admin panel: public marketing pages plus a JWT-authenticated `seguridad` (RBAC) section — usuarios, roles, grupos-url, urls — talking to the NestJS backend in `backend/`.

## Your skills

Your designated skills live in `.claude/skills/` and are prefixed `frontend-` (e.g. `frontend-vercel-react-best-practices`, `frontend-vercel-composition-patterns`). That prefix distinguishes them from `backend-` skills that will be added later for backend work — only load and apply skills under the `frontend-` prefix.

## Commands

Run these from the `frontend/` directory:

- `npm run dev` — start the dev server (Next.js App Router, port 3000)
- `npm run build` — production build (also runs type checking and linting)
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (`next/core-web-vitals`, `next/typescript`)

There is no test runner configured in this project.

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # public landing ("/")
│   ├── login/page.tsx             # "/login"
│   └── (administracion)/          # route group — organizes files, NOT part of the URL
│       ├── layout.tsx              # auth guard (redirects to /login) + PanelSidebar/PanelTopbar shell
│       ├── panel/page.tsx          # "/panel" — dashboard/welcome
│       └── seguridad/
│           ├── usuarios/page.tsx    # "/seguridad/usuarios"
│           ├── roles/page.tsx       # "/seguridad/roles"
│           ├── grupos-url/page.tsx  # "/seguridad/grupos-url"
│           └── urls/page.tsx        # "/seguridad/urls"
├── features/                      # mirrors backend/src/ 1:1 — see below
│   ├── auth/                       # ↔ backend/src/auth/
│   └── seguridad/                  # ↔ backend/src/seguridad/
│       ├── usuarios/
│       ├── roles/
│       ├── grupos-url/
│       └── urls/
├── components/
│   ├── ui/                        # shadcn primitives (design system, dumb components)
│   ├── layout/                    # site-header, panel-sidebar, panel-topbar
│   └── shared/                    # cross-feature reusable pieces (RowActionsMenu, ConfirmDeleteDialog)
├── providers/                     # auth-provider, theme-provider, query-provider — wrapped in app/layout.tsx
└── lib/
    ├── api-client.ts               # apiFetch<T>() (JSON, GET/DELETE only) + apiUpload<T>() (multipart, POST/PATCH/PUT) + ApiError — the ONLY file that touches `fetch`/base URL/headers
    ├── media-url.ts                 # mediaUrl() — turns a backend-relative path (ej. "/media/producto/x.jpg") into an absolute URL
    ├── pagination.ts                 # PaginatedResponse<T> + DEFAULT_PAGE_SIZE
    └── utils.ts                    # cn() (clsx + tailwind-merge)
```

Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

### API field naming: `snake_case`, matching the backend exactly

The backend's Prisma models use `snake_case` field names (see `backend/src/**` convention), and the NestJS layer does **not** translate them to `camelCase` anywhere in the JSON contract — request DTOs and response bodies both use `snake_case` verbatim (e.g. `grupo_url_id`, `rol_id`, `url_ids`, `creado_en`, `actualizado_en`). Mirror that exactly in `types.ts`/`api.ts` — **never** add a mapping layer (a `toCamelCase`/manual field-rename step) to translate the API's `snake_case` into `camelCase` for the frontend. Local component state variables (`useState`) may still use `camelCase` since those are internal to the component, but the moment a value crosses the wire — a `types.ts` interface field, an `api.ts` payload key, a property read off a query response — it must be spelled exactly as the backend spells it.

### Routing: route groups, not dynamic segments

`(administracion)` is a Next.js **route group** — parentheses mean the folder organizes code but is invisible in the URL. Don't confuse it with a dynamic segment (`[grupo]`), which would show up in the URL and match arbitrary values — this project deliberately moved away from a `[grupo]/[url]` catch-all to literal folders (`seguridad/usuarios/`, `seguridad/roles/`, …) so unknown paths 404 natively instead of falling through to an "under construction" placeholder. When a backend module (`backend/src/seguridad/urls`, etc.) gets a genuinely new resource, add its own literal folder under `app/(administracion)/seguridad/`, not a dynamic one.

### `features/` mirrors the backend's module layout

The backend (`backend/src/`) is organized as `auth/` (login, me, menu) + `seguridad/{usuarios,roles,grupos-url,urls}/`. The frontend's `features/` folder mirrors that **exact** split — `features/auth/` for anything the backend's `AuthController` owns (including `getMenu`, since `/auth/menu` lives there, not under `seguridad`), `features/seguridad/<entity>/` for everything under the backend's `seguridad` module. When the backend adds a new top-level module or a new entity inside `seguridad`, mirror it here with the same name, in the same place — don't invent a different grouping on the frontend side.

Each feature folder follows the same internal shape:
```
features/seguridad/usuarios/
├── api.ts          # getX(token) calls apiFetch (JSON, no body). createX(token, formData)/updateX(token, id, formData) call apiUpload — see "Every create/update talks multipart/form-data" below. deleteX(token, id) calls apiFetch (DELETE, no body).
├── hooks.ts         # TanStack Query wrappers: useUsuarios(token), useCreateUsuario(token), useUpdateUsuario(token), useDeleteUsuario(token)
├── types.ts         # this entity's TS shapes (e.g. UsuarioListItem) — cross-feature types (like the minimal Rol ref used inside Usuario) are imported from the owning feature, e.g. `import type { Rol } from "@/features/seguridad/roles/types"`
└── components/      # tables + create/edit dialogs for this entity only
```
`auth/` is the one exception with no `components/` — `AuthProvider` (in `providers/`) owns the session and calls `login`/`getMe` from `features/auth/api.ts` directly (not through a query hook), since bootstrapping the session isn't a good fit for query-cache semantics. `features/auth/hooks.ts` only exports `useMenu`.

### Data fetching: TanStack Query, one `hooks.ts` per feature

Server state (anything fetched from the backend) is owned by `@tanstack/react-query`, wired up via `providers/query-provider.tsx` (a `QueryClient` created lazily with `useState`, wrapped outermost in `app/layout.tsx`). Conventions:

- Query keys are plain string arrays scoped by entity: `["usuarios"]`, `["roles"]`, `["roles", rolId, "urls"]`, `["grupos-url"]`, `["urls"]`, `["menu"]`. No query-key-factory abstraction — there aren't enough entities yet to justify one.
- Every list query: `useQuery({ queryKey: [...], queryFn: () => getX(token!), enabled: !!token })`.
- Every mutation invalidates the query key(s) it affects in `onSuccess` (e.g. `useCreateUsuario`'s mutation invalidates `["usuarios"]`). **Never** thread an `onCreated`/`onSaved` callback from a dialog back up to its parent table to trigger a manual refetch — that's the pre-Query pattern this codebase moved away from; let invalidation do it.
- Tables consume `data`/`isLoading`/`isError` straight from the query hook, no local `useState` mirror of server data.

### Shared UI conventions (apply to every entity table/dialog you add)

- Every data table ends in an **"Acciones"** column: `RowActionsMenu` (`@/components/shared`) with "Editar"/"Eliminar" — reuse it, don't rebuild the dropdown.
- Delete always goes through `ConfirmDeleteDialog` (`@/components/shared`) — copy must be accurate about backend soft-deletes (`activo: false`), never say "se eliminará permanentemente".
- Create/edit dialogs use `DialogFooter showCloseButton` (renders "Cerrar" on the left automatically) with a plain **"Guardar"**/"Guardando..." submit button on the right — not "Guardar cambios" or anything else.
- `<Select>` (`@base-ui/react` via `@/components/ui/select`) **must** get an `items` prop (`items={options.map(o => ({ value: o.id, label: o.nombre }))}`) whenever it needs to show a human label instead of the raw stored id/value — `<SelectValue>` silently renders the raw value without it.
- When a payload field is optional and backend-validated with something stricter than "any string" (e.g. `@IsEmail()`), omit the key entirely if the input is blank rather than sending `""` — an empty string still fails format validators even under `@IsOptional()`.

### Every create/update talks multipart/form-data, never JSON

This is a deliberate, project-wide decision — **not** something scoped to entities that happen to have a file upload. `EntityDialog` (`@/components/shared/entity-dialog`) always builds a `FormData` from `toCreatePayload`/`toUpdatePayload` (via `AutoForm`, `@/components/shared/auto-form`) and sends it with `apiUpload`, regardless of whether the entity declares `fileFields`. This means:

- **Every** `createX`/`updateX` in every `api.ts` takes `(token, formData: FormData)` / `(token, id, formData: FormData)` and calls `apiUpload(path, token, formData, "POST" | "PATCH")` — never `apiFetch` + `JSON.stringify`. `apiFetch` (JSON) is reserved for `GET`/`DELETE`, which have no body.
- When adding a brand-new entity, its dialog still only needs `schema`, `fields`, `toCreatePayload`, `toUpdatePayload` (plain objects of primitives) — `EntityDialog` handles the JSON→FormData conversion internally via `appendPayload`. You never build `FormData` by hand in a dialog component unless that entity also has `fileFields` needing manual `FormData.append` for the file itself (see `ProductoDialog` for that case).
- A non-EntityDialog form (hand-rolled, like Roles' `CreateRolDialog`/`EditRolDialog`, which has a custom URL-checklist UI) still must not send JSON: build the `FormData` conversion inside that entity's `api.ts` (see `roles/api.ts`'s `toFormData()` helper) so the dialog component itself is untouched and still calls `createRol.mutateAsync({ nombre, descripcion })` with a plain object.
- An array field (e.g. Roles' `url_ids: string[]`) doesn't fit multipart's flat key/value shape — append it as a single field with `JSON.stringify(array)` as the value, and have the backend DTO `@Transform` it back with `JSON.parse` (see `AssignRolUrlsDto`). This is the one place a JSON string legitimately appears — it's still riding inside one multipart field, not as the request's `Content-Type`.
- Numbers survive the round trip fine on the frontend (`AutoForm`'s `type: "number"` fields already produce real JS numbers in `values`) — the string-coercion-of-numbers problem this convention creates only shows up on the **backend** DTOs (`@Type(() => Number)`), not here.
- File-upload UI is `ImageDropzone` (`@/components/shared/image-dropzone`) — full-width dropzone, "Eliminar archivo" button (generic wording, not "imagen", since a file field isn't necessarily an image), and, when there's a current file, a small "Archivo actual:" line linking to it (`target="_blank"`). `AutoForm`'s `fileFields` prop wires one of these per file field.

Rationale (don't relitigate this per-entity): keeping create/update on ONE wire format everywhere, whether or not files are involved today, means adding a photo/attachment to any existing entity later is a matter of declaring `fileFields` — never a wire-format migration.

### UI components (shadcn, base-mira style)

`components.json` controls `shadcn` CLI codegen: components are added under `src/components/ui`, using `@/lib/utils`, `@/components`, `@/hooks` aliases. Notable non-default choices for this project:

- Components are built on **`@base-ui/react`** primitives (not Radix UI) — e.g. `src/components/ui/button.tsx` imports from `@base-ui/react/button`.
- Variants are defined with `class-variance-authority` (`cva`) and merged via `cn()`.
- `iconLibrary` is `lucide` (`lucide-react`).
- `baseColor` is `mist`; theme uses `oklch()` color values defined as CSS custom properties in `globals.css`.

Add new shadcn components with the `shadcn` CLI (`npx shadcn@latest add <component>`) rather than hand-writing primitives, to stay consistent with the base-mira/base-ui conventions already in use.

### Styling: Tailwind v4 (CSS-first config)

This project uses **Tailwind CSS v4**, not v3 — there is no `tailwind.config.ts`. Configuration lives entirely in `src/app/globals.css`:

- `@import "tailwindcss";` replaces the old `@tailwind base/components/utilities` directives.
- `@import "shadcn/tailwind.css";` pulls in shadcn's shared v4 utilities/variants (e.g. `data-*` custom variants, animation keyframes).
- `@import "tw-animate-css";` adds animation utilities.
- Design tokens (`--background`, `--primary`, `--border`, `--sidebar-*`, etc.) are defined as CSS custom properties under `:root` and `.dark`, using `oklch()` colors.
- A `@theme inline { ... }` block maps those custom properties to Tailwind's `--color-*`/`--radius-*` tokens — this is what makes utility classes like `bg-background`, `border-border`, `text-primary-foreground` resolve. **When adding a new design token, it must be added both as a CSS variable (`:root`/`.dark`) and inside this `@theme inline` block**, or Tailwind will fail to compile with a "class does not exist" error.
- `postcss.config.mjs` uses the `@tailwindcss/postcss` plugin (v4), not the legacy `tailwindcss` plugin.

### Fonts

`layout.tsx` loads `Outfit` via `next/font/google` as `--font-sans` (applied via `font-sans` on `<html>`), plus local Geist fonts (`--font-geist-sans`, `--font-geist-mono`) that are leftovers from the `create-next-app` template and not yet wired into the theme.
