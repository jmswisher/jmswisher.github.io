# Portfolio Data

See `ontology.md` for high-level descriptions of the entities represented by the JSON files.

## Entity definitions

### site
A singleton config object for the portfolio site.

File: `/data/site.json`

Cardinality: Exactly one

Required fields:

- `site_id`: string
- `site_title`: string
- `owner_name`: string

Optional fields:

- `site_tagline`: string
- `contact_email`: string
- `base_url`: string
- `default_cta_label`: string
- `default_cta_url`: string

### organization

An employer, client, hiring organization or other corporate entity associate with positions, projectss or documents.

File: `/data/organizations.json`

Required fields:

- `organization_id`: string, `org_` + unique digits
- `name`: string

Optional fields:

- `short_name`: string
- `type`: string: "employer", "hiring_org", or "client"
- `industry`: string
- `notes`: string

### position

A target portfolio page or target role. A position is not necessarily identical to a historical job title. It might represent a tailored portfolio view for a prospective role.

File: `data/positions.json`

Required fields:

- `position_id`: string, `pos_` + unique digits
- `position_title`: string
- `page_slug`: string
- `public_label`: string
- `publish`: Boolean

Optional fields:

- `organization_id`: string
- `headline`: string
- `summary`: string
- `position_sequence`: number
- `priority_sample_types`: array of strings
- `priority_skills`: array of strings
- `resume_pdf_path`: string
- `cta` : object

`cta` object fields:

- `label`: string
- `url`: string

### document

The canonical record for a source artifact. A document represents the real underlying piece of work, such as a documentation topic or article. It can be accessed in multiple ways, such as a PDF file, web page, or archived web page.

Cardinality: One document may have multiple sample records.

File: `data/documents.json`

Required fields:

- `document_id`: string
- `title`: string
- `organization_id`: string
- `public_ok`: Boolean
- `status`: string

Optional fields:

- `source_employer`: string (organization.organization_id)
- `source_role`: string
- `doc_url`: string
- `archive_url`: string
- `pdf_path`: string
- `preview_image_path`: string
- `notes`: string

Allow `status` values:

- "draft"
- "ready"
- "archived"

`organization_id` is the canonical organization link.
`source_organization_name` may be retained for convenience or migration compatibility, but the normalized relationship is `document.organization_id` -> `organization.organization_id`.

### sample

A portfolio-facing sample view derived from a canonical `document`.

This is the most important conceptual distinction in the ontology.

A sample is not the source artifact itself. It is a framed portfolio representation of that artifact, possibly emphasizing one rhetorical mode, topic slice, or fit for a specific audience.

Cardinality: One document can support multiple samples.

File: `/data/samples.json`

Required fields:

- `sample_id` : string
- `document_id` : string
- `title` : string
- `sample_type` : string
- `summary` : string
- `publish` : Boolean

Optional fields:

- `content_skill` : string
- `asset_type` : string
- `audience` : string
- `skills` : array of strings
- `topics` : array of strings
- `industries` : array of strings
- `fit_note` : string
- `pdf_path` : string
- `image_path` : string
- `live_url` : string
- `archive_url` : string

Examples of `sample_type` values:

- `concept`
- `reference`
- `developer-guide`
- `security-guide`
- `troubleshooting`
- `workflow`
- `admin-guide`
- `architecture`
- `release-note`
- `tutorial`

Examples of `content_skill` values:

- `procedural-instructions`
- `conceptual-explanation`
- `risk-analysis`
- `best-practices-guidance`
- `workflow-explanation`
- `reference-structuring`

### selection

A join entity linking a `position` to a `sample`.

Selections determine which samples appear on which position pages and in what order. Selections are the primary mechanism for portfolio page curation.

File: `/data/selections.json`

Required fields:

- `selection_id` : string
- `position_id` : string
- `sample_id` : string
- `priority_rank` : number
- `publish` : Boolean

Optional fields:

- `display_group` : string
- `custom_label` : string
- `custom_fit_note` : string

Cardinality: A sample may appear in many selections.
A position may contain many selections.

### project

A standalone portfolio project or case study.

Projects are a separate content family from document-derived writing samples. They should not be forced into the `document` / `sample` model unless future requirements clearly justify that convergence.

File: `/data/projects.json`

Required fields:

- `project_id` : string
- `title` : string

Optional fields:

- `one_liner` : string
- `summary` : string
- `skills` : array of strings
- `topics` : array of strings
- `industries` : array of strings
- `image_path` : string
- `image_alt` : string
- `pdf_path` : string
- `github_url` : string
- `demo_url` : string
- `employer_fit_note` : string
- `publish` : Boolean

## Relationship rules

`organization -> position`

A position may optionally belong to an organization.

```
position.organization_id -> organization.organization_id
```

`organization -> document`

Every document must belong to one organization.

```
document.organization_id -> organization.organization_id
```

`document -> sample`

Every sample must belong to one document.

```
sample.document_id -> document.document_id
```

`position -> selection`

Every selection must belong to one position.

```
selection.position_id -> position.position_id
```

`sample -> selection`

Every selection must reference one sample.

```
selection.sample_id -> sample.sample_id
```

## Validation rules

### Required referential integrity

- Every `document.organization_id` must exist in `organizations.json`.
- Every `sample.document_id` must exist in `documents.json`.
- Every `selection.position_id` must exist in positions.json.
- Every `selection.sample_id` must exist in `samples.json`.

### Uniqueness

The following must be unique within their collections:

- `site.site_id`
- `organization.organization_id`
- `position.position_id`
- `position.page_slug`
- `document.document_id`
- `sample.sample_id`
- `selection.selection_id`
- `project.project_id`

## Selection rank rule

Within a single position, `priority_rank` values should be unique unless the display intentionally supports tied ordering.

Recommended rule:

For each `position_id`, `priority_rank` values should be unique.

## Publish behavior

- Records with `publish: false` must not be rendered on public pages.
- A selection must not render if either the referenced sample or the selection itself has `publish: false`.
- A sample must not render if the referenced document has `public_ok: false`.
- A document with `status: archived` may still be referenced historically, but rendering behavior should be explicit in the build logic.

## Build expectations

The build system should treat JSON files in `/data` as the source of truth.

### Position page rendering

A position page is generated by:

1. loading the `position`
1. finding all `selection` records for that `position_id` with `publish: true`
sorting by `priority_rank`
1. resolving each `sample`
1. resolving each sample’s parent `document`
1. rendering visible sample cards with document/source metadata
