# Portfolio Data Ontology

This document defines the canonical data ontology for the static portfolio system.

The system is a small knowledge graph used to generate position-specific portfolio pages from reusable writing samples and projects. JSON files in `/data` are the source of truth. The build system renders those JSON files into static HTML/CSS.

## Design goals

* Keep the source data human-readable and GPT-editable.
* Separate canonical source documents from portfolio-facing sample views.
* Normalize relationships so that one document can support multiple samples and one sample can appear in multiple position pages.
* Keep projects as a separate content family from document-derived writing samples.
* Make the schema stable enough for deterministic validation and export.

## Entity overview

The ontology contains seven entity types:

* `site`
* `organization`
* `position`
* `document`
* `sample`
* `selection`
* `project`

### Relationship graph

```text
site
  └── has many positions
  └── has many projects

organization
  └── has many positions
  └── has many documents

position
  └── belongs to 1 organization
  └── has many selections

document
  └── belongs to 1 organization
  └── has many samples

sample
  └── belongs to 1 document
  └── can appear in many selections

selection
  └── links one position to one sample

project
  └── independent portfolio entity
```

## Entity definitions

The following subsections provide information about each entity.
Note that the order in which the fields are listed is the preferred order for them when adding or modifying records in the corresponding files.

### document

The canonical record for a source artifact. A document represents the real underlying piece of work, such as a documentation topic or article. It can be accessed in multiple ways, such as a PDF file, web page, or archived web page.

Cardinality: One document may have multiple sample records.

File: `data/documents.json`

Required fields:

* `document_id`: string, unique identifier for the document: `doc_` + unique digits
* `title`: string, original title of the document
* `public_ok`: Boolean, whether this document can be shared publicly

Optional fields:

* `source_employer`: string, `organization.organization_id` of the employer this document was written for
* `source_role`: string, title of the role in which this document was written
* `notes`: string, any notes about this document (not exposed on portfolio site)
* `doc_url`: string, URL of the live version of the document
* `archive_url`: string, URL of an archived version of the document
* `pdf_path`: string, local path to a PDF version of the document
* `preview_image_path`: string, local path to a preview image of the document
this document was written for
* `status`: string, stage of development of the document, allowed values: "draft", "ready" (default), "archived"

### organization

An employer, client, hiring organization or other corporate entity associate with positions, projects or documents.

File: `/data/organizations.json`

Required fields:

* `organization_id`: string, unique identifier for the organization; `org_` + unique digits

Optional fields:

* `name`: string, name of the company, which may be a placeholder for prospective employers, for privacy reasons
* `short_name`: string, a shortened version of the name
* `org_type`: string, one of: "employer", "hiring_org", "client", or "other
* `notes`: string, any notes about the organization

### position

A target portfolio page or target role. A position is not necessarily identical to a historical job title. It might represent a tailored portfolio view for a prospective role.

File: `data/positions.json`

Required fields:

* `position_id`: string, unique identifier for a position: `pos_` +  `organization_id` + `position.page_slug`
* `page_slug`: string, base of the name of the HTML file for the position page
* `publish`: Boolean, whether this position can be published on the site

Optional fields:

* `position_title`: string, title of the position and page
* `public_label`: string, title of the position on the home page
* `organization_id`: string, must match the ID of an existing organization
* `headline`: string, brief description of a position
* `summary`: string, description of the samples on the page and what they demonstrate
* `position_sequence`: number, relative order of this position; not used
* `priority_sample_types`: array of strings, content types to that should be selected for this position
* `priority_skills`: array of strings, professional skills that selected samples should demonstrate
* `target_role`: string, term above the title of the position page, defaults to "Role"
* `resume_pdf_path`: string, local path to a PDF of a resume for this position
*`cta` : object, representing a call to action, with the following fields

  * `label`: string, label for the action button
  * `url`: string, URL for the action

### project

A standalone portfolio project or case study.

Projects are a separate content family from document-derived writing samples. They should not be forced into the `document` / `sample` model unless future requirements clearly justify that convergence.

This object type is not currently used, but is intended for future enhancement of the portfolio site.

File: `/data/projects.json`

Required fields:

* `project_id`: string, unique identifier for the project: `proj_` + brief descriptive string
* `title` : string, title of the project

Optional fields:

* `one_liner`: string, brief description of the project
* `skills`: array of strings, skills used in the project
* `employer_fit_note`: string, description of what types of employers might be interested in this project
* `image_path`: string, local path to an image for the project
* `image_alt`: string, alt text for the project image
* `pdf_path`: string, local path to a PDF related to the project
* `github_url`: string, URL of a GitHub repo for the project
* `demo_url`: string, URL of a demo of the project

### sample

A portfolio-facing sample view derived from a canonical `document`.

This is the most important conceptual distinction in the ontology.

A sample is not the source artifact itself. It is a framed portfolio representation of that artifact, possibly emphasizing one rhetorical mode, topic slice, or fit for a specific audience.

Cardinality: One document can support multiple samples.

File: `/data/samples.json`

Required fields:

* `sample_id`: string, unique identifier for the sample, `smp_` + unique digits
* `document_id`: string, document this sample represents; must match a `document_id` in `documents.json`
* `publish`: Boolean, whether the sample can be published

Optional fields:

* `title`: string, title of the sample (might not be the same as the document title)
* `source_employer`: string, `organization.org_id` of the employer for whom this was done
* `asset_type`: string, how the sample was originally published: "web page", "PDF", "other"
* `audience`: array of strings, type of audience
* `content_skill`: tag for the primary type of content-creation skill this sample represents
* `position_fit_note`: string, explanation of why this sample is illustrative for this position
* `sample_type`: string, content type of the sample
* `skills`: array of strings, general skills that this sample demonstrates
* `summary`: string, description of the sample
* `topics`: array of strings, topics covered by the sample
* `industries`: array of strings, industries where this sample is applicable
`archive_url`: string, URL of an archived version of the sample
* `image_path`: string, path to a thumbnail image
* `live_url`: string, URL of a live version of the sample
* `pdf_path`: string, local path to a PDF of the sample

Examples of `audience` values:

* `developers`
* `web developers`
* `administrators`
* `platform administrators`
* `enterprise architects`
* `end users`

Examples of `sample_type` values:

* `concept`
* `best-practices`
* `reference`
* `troubleshooting`
* `release-note`
* `procedure`
* `tutorial`

Examples of `content_skill` values:

* `procedural-instructions`
* `conceptual-explanation`
* `risk-analysis`
* `best-practices-guidance`
* `workflow-explanation`
* `reference-structuring`

Examples of `skills` values:

* `Best practices guidance`
* `Conceptual explanation`
* `Configuration guidance`
* `Cross-team collaboration`
* `Developer tools`
* `Integration guidance`
* `Platform administration`
* `Procedural instructions`
* `Risk analysis`
* `Security concepts`
* `Structured reference`
* `Troubleshooting guidance`
* `Workflow explanation`

Examples of `industries` values:

* `enterprise software`
* `developer platform`
* `web platform`
* `browser ecosystem`

### selection

A join entity linking a `position` to a `sample`.

Selections determine which samples appear on which position pages and in what order. Selections are the primary mechanism for portfolio page curation.

File: `/data/selections.json`

Required fields:

* `selection_id`: string, unique identifier for the selection, typically `sel_pos_` + `organization_id` + `position.page_slug`
* `position_id`: string, unique ID of an existing position
* `sample_id`: string, unique ID of an existing sample selected for the position
* `priority_rank` : priority of this selection among those for a given position
* `publish` : Boolean, whether this selection can be published

Optional fields:

* `display_group` : string, name of a group of similar selections for display purposes
* `custom_label`: string, a label that supersedes the sample title
* `custom_fit_note`: string, supersedes the sample's position fit note

Cardinality: A sample may appear in many selections.
A position may contain many selections.

### site

A singleton config object for the portfolio site.

File: `/data/site.json`

Cardinality: Exactly one

Required fields:

* `site_title`: string, title for the site, used as a title for the home page

Optional fields:

* `site_tagline`: string, lede on the home page
* `owner_name`: string, owner of the site, for identification
* `contact_email`: string, fallback email address used when `cta.url` is not defined

## Relationship rules

`organization -> position`

A position may optionally belong to an organization.

```text
position.organization_id -> organization.organization_id
```

`organization -> document`

Every document must belong to one organization.

```text
document.organization_id -> organization.organization_id
```

`document -> sample`

Every sample must belong to one document.

```text
sample.document_id -> document.document_id
```

`position -> selection`

Every selection must belong to one position.

```text
selection.position_id -> position.position_id
```

`sample -> selection`

Every selection must reference one sample.

```text
selection.sample_id -> sample.sample_id
```

## Validation rules

### Required referential integrity

* Every `document.organization_id` must exist in `organizations.json`.
* Every `sample.document_id` must exist in `documents.json`.
* Every `selection.position_id` must exist in `positions.json`.
* Every `selection.sample_id` must exist in `samples.json`.

### Uniqueness

The following must be unique within their collections:

* `organization.organization_id`
* `position.position_id`
* `position.page_slug`
* `document.document_id`
* `sample.sample_id`
* `selection.selection_id`
* `project.project_id`

## Selection rank rule

Within a single position, `priority_rank` values should be unique unless the display intentionally supports tied ordering.

Recommended rule:

For each `position_id`, `priority_rank` values should be unique.

## ID stability rules

* IDs are permanent once published in source data.
* IDs must not be repurposed
* An ID of a deleted item should not be reused for a new item.

## Publish behavior

* Records with `publish: false` must not be rendered on public pages.
* A selection must not render if either the referenced sample or the selection itself has `publish: false`.
* A sample must not render if the referenced document has `public_ok: false`.
* A document with `status: archived` may still be referenced historically, but rendering behavior should be explicit in the build logic.

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
