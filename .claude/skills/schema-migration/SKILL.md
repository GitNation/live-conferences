---
description: Create or modify a Hygraph schema — models, components, fields, component unions, and enums — via the management API. Use when the user wants to change the CMS structure (e.g. "add a Price component", "create a field on Section", "add a value to the SectionKey enum", "make this field required", "put Feature into the blocks union", "remove a field's description"). Runs migrations safely (dry-run first), follows Hygraph's casing rules, and knows the traps this repo has hit. Does NOT fill entries with data (that's content work) and CANNOT delete (Studio only).
argument-hint: <what to change, e.g. "add customData JSON to Price">
---

This skill makes **schema changes** in Hygraph through the management API (`submit_batch_migration`). It creates/updates models, components, fields, component-union fields, and enums.

It does **NOT**: fill entries with content (that's a separate content task), and it **cannot delete** fields/models/enum-values — the Hygraph MCP blocks all delete/unpublish mutations, so deletions are handed back to the user for Studio.

> **Prerequisite:** the Hygraph MCP must be connected with schema/management permissions. Verify with `get_project_info`; on 403/404 the token is wrong — stop and tell the user to fix `.mcp.json` and reconnect.

---

## The golden rule: dry-run, then apply

**Every** migration runs twice:
1. `submit_batch_migration` with `dry_run: true` → validates structure without touching the project.
2. Only if it returns `VALIDATED` → run again with `dry_run: false`.

Never skip the dry-run. Some checks (duplicates, cycles) only surface on the real run, but the dry-run catches every casing/shape error cheaply.

---

## Step 0 — Understand the target before changing it

Before any migration, read the current shape so you don't guess field names or clash with existing ones:

- `get_project_info` — enum values, allowed types, project state.
- `get_entity_schema(typename)` — fields on a model/component, their types, required flags, and (critically) whether a field is a plain component vs a **component union** (they need different update operations).
- For exact input shapes, `get_management_operation_schema(operation_name)` for **each** operation you plan to use — the input params are case-sensitive and easy to get wrong.

Do this even for "simple" one-field additions. A wrong assumption about an existing field's type is the most common cause of a failed migration here.

## Step 1 — Get the required operation schemas

Call `get_management_operation_schema` for every distinct `operation_name` in your plan. Common ones:

| Goal | Operation |
|------|-----------|
| New model | `createModel` |
| New scalar field (String/Int/Boolean/JSON/…) | `createSimpleField` |
| Edit a scalar field (required, description, rename) | `updateSimpleField` |
| Embed one component type | `createComponentField` |
| Edit a component field | `updateComponentField` |
| A field that accepts several component types | `createComponentUnionField` / `updateComponentUnionField` |
| New enum | `createEnumeration` |
| Add/rename enum values | `updateEnumeration` |
| New enum-typed field | `createEnumerableField` |

## Step 2 — Build the batch, respecting casing

Casing is validated immediately — get it right or the dry-run rejects it:

- **Models / components** → `PascalCase` (`BlogPost`, `Price`). `apiId` must differ from `apiIdPlural`.
- **Fields** → `camelCase` starting lowercase (`title`, `customData`).
- **Scalar types** → `UPPERCASE` (`STRING`, `INT`, `BOOLEAN`, `JSON`, `DATETIME`, …). `"string"` fails.
- **Enum values** → `UPPER_SNAKE_CASE` **apiId** (`IN_PERSON`) — but `displayName` can be any case (`inPerson`). Keep displayName consistent with sibling values (this repo keeps section/card keys lowercase-ish; match neighbours).

Order matters: create dependencies first (model → its fields → relations). Keep batches under ~10 operations for clear error messages.

## Step 3 — Dry-run, then apply

```
submit_batch_migration({ changes: [...], dry_run: true })   // expect VALIDATED
submit_batch_migration({ changes: [...], dry_run: false })  // expect SUCCESS
```

Migration `name` must be unique per environment (the tool auto-names). On a failed run, retry with a fresh name.

## Step 4 — Report

State plainly what changed (model/component, fields, types, required flags), whether it's SUCCESS, and any **user follow-up** required — deletions in Studio, Studio field-renderer settings (e.g. set Markdown renderer), or a code-layer change in `graph-content-layer` (fragment + formatter) so the new field actually reaches templates.

---

## Traps this repo has hit (read before migrating)

- **Deletions are Studio-only.** The MCP blocks delete/unpublish mutations. When a change needs a field removed (e.g. converting a component-union `button` into a plain modular one), **you cannot do it** — instruct the user to delete the field in Studio, then create the replacement with a migration. To clear a component *list you filled by mistake*, `update_entry` with `{ field: { delete: [{id}] } }` is NOT blocked (content op, fetch ids first).

- **Empty string `""` does NOT clear a description.** The API treats `description: ""` as "no change" and keeps the old text. To visually blank a description, pass a **single space `" "`**. (Confirmed: only the non-empty value overwrote; `""` was ignored.)

- **Component-union fields need their own operation.** A field that holds several component types (`pieceOfText`, `blocks`, `globalBlocks` on `Section`) is a *component union* — use `updateComponentUnionField` (with `componentApiIds` to change members), NOT `updateComponentField`. Querying it also needs `__typename` + `... on Type { }`, not direct field selection.

- **`plain component` vs `component union` look identical until they break.** A `button` created as a component union (`XbuttonUnion`) rejects `button { id ... }` in queries ("field 'id' is not defined in 'XbuttonUnion'"). A `button` created as a plain modular component accepts `button { fields }` directly. If you need the simple form, create the field with `createComponentField` (single `componentApiId: "Button"`), not a union.

- **`Required` in a component union causes nullability conflicts.** If several members of a union (e.g. `blocks`: DeepDive | Feature | Price) share a field name like `title`, and one member marks it `Required` (`String!`) while others don't (`String`), the merged query fails: *`Fields "title" conflict because they return conflicting types "String" and "String!"`*. Fix by dropping `Required` on the conflicting member's field (`updateSimpleField isRequired:false`) — don't alias in the fragment.

- **50-component limit on component-list fields is real and unraisable** (Studio platform limit). For large repeated content, prefer models over components, or a relation field.

- **A field is not "done" until the code layer knows it.** A new field on a section/card only reaches templates after `graph-content-layer` gets a matching fragment field + formatter handling, rebuilt into `dist` and copied into `node_modules`. That's a separate step (the datalayer work) — flag it in the report; don't silently assume the field will appear on the site.

- **Build reads PUBLISHED.** Schema changes are live immediately, but any *content* you'd add later must be published to show in a build. This skill only touches schema; note the publish need if relevant.
