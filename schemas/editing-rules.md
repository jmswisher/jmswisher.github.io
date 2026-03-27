# Editing rules for GPT or automated transformations

## Safe editing principles

- Never change an existing ID unless explicitly performing a controlled migration.
- Never delete a referenced record without also removing or repairing all dependent references.
- Prefer appending new records over mutating historical records.
Maintain referential integrity across all ID relationships.
- Use arrays, booleans, and numbers in native JSON form.
- Preserve existing field order where practical for diff readability.

## Adding a new document-derived sample workflow

When adding a new writing sample:

1. Create or identify the `organization`
1. Create or identify the `document`
1. Create one or more `sample` records derived from that document
1. Add `selection` records linking relevant samples to relevant positions

## Adding a standalone project workflow

When adding a new project:

1. Create a new `project`
1. Set `publish`
1. Add rendering support only if needed by the build system
