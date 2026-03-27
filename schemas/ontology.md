# Portfolio Data Ontology

This document defines the canonical data ontology for the static portfolio system.

The system is a small knowledge graph used to generate position-specific portfolio pages from reusable writing samples and projects. JSON files in `/data` are the source of truth. The build system renders those JSON files into static HTML/CSS.

## Design goals

- Keep the source data human-readable and GPT-editable.
- Separate canonical source documents from portfolio-facing sample views.
- Normalize relationships so that one document can support multiple samples and one sample can appear in multiple position pages.
- Keep projects as a separate content family from document-derived writing samples.
- Make the schema stable enough for deterministic validation and export.

## Entity overview

The ontology contains seven entity types:

- `site`
- `organization`
- `position`
- `document`
- `sample`
- `selection`
- `project`

### Relationship graph

```text
site
  └── has many positions
  └── has many projects

organization
  └── has many positions
  └── has many documents

position
  └── belongs to organization
  └── has many selections

document
  └── belongs to organization
  └── has many samples

sample
  └── belongs to document
  └── can appear in many selections

selection
  └── links one position to one sample

project
  └── independent portfolio entity