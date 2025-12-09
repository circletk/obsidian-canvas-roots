# Roadmap

This document outlines planned features for Canvas Roots. For completed features, see [Release History](Release-History). For version-specific changes, see the [GitHub Releases](https://github.com/banisterious/obsidian-canvas-roots/releases).

---

## Table of Contents

- [Completed Features](#completed-features)
- [Planned Features](#planned-features)
  - [Sex/Gender Identity Expansion](#sexgender-identity-expansion) ⚡ High
  - [Export v2: Full Entity Export](#export-v2-full-entity-export) ⚡ High
  - [Calendarium Integration](#calendarium-integration) 📋 Medium
  - [Reports & Print Export](#reports--print-export) 📋 Medium
  - [Research & Analysis Tools](#research--analysis-tools) 📋 Medium
  - [Transcript Nodes & Oral History](#transcript-nodes--oral-history) 💡 Low
- [Future Considerations](#future-considerations)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## Completed Features

For detailed implementation documentation of completed features, see [Release History](Release-History).

| Version | Feature | Summary |
|:-------:|---------|---------|
| v0.10.17 | [Data Enhancement Pass](Release-History#data-enhancement-pass-v01017) | Generate place notes from existing data with progress and editing |
| v0.10.3 | [Type Customization](Release-History#type-customization-v0103) | Full type managers for all note categories |
| v0.10.2 | [Flexible Note Type Detection](Release-History#flexible-note-type-detection-v0102) | Support cr_type, tags, avoids conflicts |
| v0.10.1 | [GEDCOM Import v2](Release-History#gedcom-import-v2-v0101) | Enhanced import with sources, events, and places |
| v0.10.0 | [Chronological Story Mapping](Release-History#chronological-story-mapping-v0100) | Event notes, timelines, narrative support |
| v0.9.4 | [Value Aliases](Release-History#value-aliases-v094) | Custom terminology for property values |
| v0.9.3 | [Property Aliases](Release-History#property-aliases-v093) | Map custom property names to canonical fields |
| v0.9.2 | [Events Tab](Release-History#events-tab-v092) | Control Center tab for event management |
| v0.9.1 | [Style Settings Integration](Release-History#style-settings-integration-v091) | Customize colors via Style Settings plugin |
| v0.9.0 | [Evidence Visualization](Release-History#evidence-visualization-v090) | GPS-aligned research methodology tools |
| v0.8.0 | [Source Media Gallery](Release-History#source-media-gallery--document-viewer-v080) | Evidence management and citation generator |
| v0.7.0 | [Organization Notes](Release-History#organization-notes-v070) | Non-genealogical hierarchies |
| v0.7.0 | [Fictional Date Systems](Release-History#fictional-date-systems-v070) | Custom calendars and eras |
| v0.7.0 | [Custom Relationship Types](Release-History#custom-relationship-types-v070) | Non-familial relationships |
| v0.6.3 | [Schema Validation](Release-History#schema-validation-v063) | User-defined data quality rules |
| v0.6.2 | [Maps Tab](Release-History#maps-tab-v062) | Control Center tab for map management |
| v0.6.0 | [Geographic Features](Release-History#geographic-features-v060) | Interactive Leaflet.js map view |
| v0.6.0 | [Import/Export Enhancements](Release-History#importexport-enhancements-v060) | GEDCOM, GEDCOM X, Gramps, CSV support |

---

## Planned Features

Features are prioritized to complete the data lifecycle: **import → enhance → export/share**.

| Priority | Label | Description |
|----------|-------|-------------|
| ⚡ High | Core workflow | Completes essential data portability |
| 📋 Medium | User value | Highly requested sharing/output features |
| 💡 Low | Specialized | Advanced use cases, niche workflows |

---

### Sex/Gender Identity Expansion

**Priority:** ⚡ High — Inclusive handling for writers and worldbuilders

**Summary:** More inclusive handling of sex and gender for writers and worldbuilders, while maintaining GEDCOM compatibility for genealogists. Leverages the existing Schema system for custom value definitions.

**Current state:** The `sex` field follows GEDCOM standards (M/F) for historical record compatibility. The "Normalize sex values" batch operation standardizes variations to M/F.

**Phased Approach:**

| Phase | Feature | Complexity | Description |
|-------|---------|------------|-------------|
| 1 | Separate `gender_identity` field | Low | Optional field for gender identity, distinct from biological sex |
| 2 | Schema-based sex/gender definitions | Done | Use existing Schema system to define allowed values per universe/collection |
| 3 | Value Aliases for sex field | Low-Medium | Expand existing Value Aliases to support custom sex field mappings |
| 4 | Configurable normalization | Medium | Option to skip sex normalization or use custom rules |

**User personas:**
- **Genealogist:** Uses `sex` field with GEDCOM M/F values; optionally `gender_identity` for living relatives or LGBTQ+ research
- **Fiction writer / Worldbuilder:** Custom sex values via Schema, `gender_identity` field, flexible normalization

**Implementation notes:**
- Phase 2 already works—the [Schema system](Release-History#schema-validation-v063) supports `enum` types with custom `values` arrays, scoped by collection/universe
- Value Aliases ([v0.9.4](Release-History#value-aliases-v094)) would need extension to cover the `sex` field
- Export formats would need mapping for non-standard values

See [Sex/Gender Identity Expansion Planning Document](https://github.com/banisterious/obsidian-canvas-roots/blob/main/docs/planning/sex-gender-expansion.md) for implementation details.

---

### Calendarium Integration

**Priority:** 📋 Medium — Unified timeline experience for fictional worldbuilders

**Summary:** Integration with the [Calendarium](https://plugins.javalent.com/calendarium) plugin to share calendar definitions, eliminating duplicate configuration for worldbuilders. Designed to be invisible to users who don't need it—settings default to off, and no UI changes appear unless Calendarium is installed.

**User Feedback (December 2024):**
- Calendar definition is the main value—users want Calendarium for setting up calendar structure (dates, eras), not primarily for events
- Date ranges (`fc-date` + `fc-end`) are important for lifespans, reign periods, residences
- Pain points with Calendarium include era handling and per-calendar frontmatter fields
- Phase 1 (read-only calendar import) validated as the right starting point

**Integration Modes:**

| Mode | Description | Use Case |
|------|-------------|----------|
| Standalone | Canvas Roots manages its own calendars | Users without Calendarium |
| Calendarium Primary | Canvas Roots reads Calendarium calendars | Existing Calendarium users |
| Bidirectional | Full sync between both plugins | Power users wanting unified experience |

**Phased Approach:**
- **Phase 1 (recommended):** Import calendar definitions from Calendarium—delivers ~80% of value
- **Phase 2:** Display Calendarium events on Canvas Roots timelines; support date ranges (`fc-end`)
- **Phase 3:** Bidirectional sync between plugins
- **Phase 4:** Cross-calendar date translation

**Data Mapping:**

| Canvas Roots Field | Calendarium Field |
|--------------------|-------------------|
| `fictional_date` | `fc-date` / `fc-start` |
| `fictional_date_end` | `fc-end` |
| `calendar_system` | `fc-calendar` |
| `event_category` | `fc-category` |
| `display_name` | `fc-display-name` |

**Settings:**
- `calendariumIntegration`: off / read-only / bidirectional
- `calendariumDefaultCalendar`: Which calendar to use when creating events
- `syncCalendariumEvents`: Whether to show Calendarium events on timelines

**API Integration:** Uses `window.Calendarium` global when available, with graceful fallback when Calendarium is not installed.

**Future Consideration:** Per-calendar frontmatter fields (e.g., `mycalendar-date` instead of `fc-calendar` + `fc-date`) to allow one note to have dates across multiple calendars.

See [Calendarium Integration Planning Document](https://github.com/banisterious/obsidian-canvas-roots/blob/main/docs/planning/calendarium-integration.md) for implementation details.

---

### Export v2: Full Entity Export

**Priority:** ⚡ High — Completes import/export round-trip with GEDCOM Import v2

**Summary:** Enhanced export functionality that includes events, sources, places, and media in addition to person notes. Ensures round-trip fidelity with GEDCOM Import v2 and enables complete data portability.

**Current Limitation:** All four exporters (GEDCOM 5.5.1, GEDCOM X, Gramps XML, CSV) only export person notes. Event notes, source notes, place notes, and media files created by Import v2 are lost on export.

**Planned Features:**
- **Event Export:** Export all event notes linked to persons (30+ event types)
- **Source Export:** Export source notes with citations linked to events
- **Place Export:** Export place hierarchy with coordinates
- **Media Export:** Bundle media files (images, documents, audio) in ZIP archive
- **GEDCOM 7.0 Support:** Modern format with native media embedding
- **Format-specific mappings:** GEDCOM tags, GEDCOM X facts, Gramps XML events
- **Sensitive field redaction:** SSN and identity numbers automatically removed
- **UI enhancements:** Checkboxes to include/exclude entity types and media options
- **Enhanced export experience:** Progress modal with real-time feedback, export preview with entity counts, and export history tracking

**Supported Formats:**
| Format | Events | Sources | Places | Media |
|--------|--------|---------|--------|-------|
| GEDCOM 5.5.1 | ✅ inline tags | ✅ SOUR records | ✅ PLAC hierarchy | ⚠️ limited OBJE |
| GEDCOM 7.0 | ✅ inline tags | ✅ SOUR records | ✅ PLAC records | ✅ full OBJE support |
| GEDCOM X | ✅ person facts | ✅ sourceDescriptions | ✅ placeDescriptions | ✅ artifacts |
| Gramps XML | ✅ event records | ✅ source records | ✅ placeobj records | ✅ objects |
| CSV | ✅ event rows | ✅ source rows | ✅ place rows | ✅ media rows |

See [Export v2 Planning Document](https://github.com/banisterious/obsidian-canvas-roots/blob/main/docs/planning/export-v2.md) for implementation details.

---

### Reports & Print Export

**Priority:** 📋 Medium — Tangible output for sharing and research documentation

**Summary:** Generate structured reports and print-ready outputs for genealogists, writers, worldbuilders, and historians. Reports are saved as Markdown notes with wikilinks for seamless integration with Obsidian's linking and search.

**User Personas:**
- **Genealogists:** Family Group Sheets, Ahnentafel reports, source bibliographies
- **Writers & Worldbuilders:** Character sheets, cast lists, faction rosters, age audits
- **Historians:** Prosopography reports, cohort analysis, evidence matrices

---

#### Report Types

**Genealogy Reports (v1 Priority):**

| Report | Description |
|--------|-------------|
| **Family Group Sheet** | Single family unit: couple + children with dates, places, sources |
| **Individual Summary** | All known facts for one person with source citations |
| **Ahnentafel Report** | Numbered ancestor list (1=subject, 2=father, 3=mother, etc.) |
| **Register Report** | Descendants with genealogical numbering (NGSQ style) |
| **Pedigree Chart** | Ancestor tree, 4-5 generations per page |
| **Descendant Chart** | All descendants of an ancestor |

**Worldbuilding Reports:**

| Report | Description |
|--------|-------------|
| **Character Sheet** | Single character with relationships, events, affiliations |
| **Cast List** | All characters filtered by universe/collection/faction |
| **Organization Roster** | Members of a faction/guild/house with roles and dates |
| **Faction Timeline** | Events filtered by group tag |
| **Age Audit** | Characters' ages at key story dates (catch anachronisms) |
| **Lifespan Overlap** | Which characters could have met? Matrix of overlapping lifetimes |

**Historian Reports:**

| Report | Description |
|--------|-------------|
| **Source Bibliography** | All sources with full citations, grouped by type |
| **Evidence Matrix** | Facts vs. sources grid showing which sources support which claims |
| **Cohort Analysis** | People sharing characteristics (occupation, location, time period) |
| **Prosopography** | Collective biography of a defined group |

**Creative Writing Reports:**

| Report | Description |
|--------|-------------|
| **Character Arc** | Single character's journey: events, relationships formed/lost |
| **Scene Outline** | Events organized by chapter/book with POV, setting, participants |
| **POV Coverage** | Which events are witnessed by which POV characters |
| **Subplot Timeline** | Events filtered by group tag with arc status and intersections |
| **Appearances by Book** | Character presence across volumes in a series |

---

#### Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **Markdown** | Note with wikilinks, embeddable | Primary format, Obsidian-native |
| **PDF** | Print-ready via browser print | Sharing with family, archival |
| **Dataview Query** | Live query instead of static snapshot | Dynamic reports that auto-update |

**PDF Approach:** Reports generate Markdown with print-optimized CSS. Users print via browser (Ctrl/Cmd+P) for PDF. Power users can use Pandoc for advanced formatting.

---

#### UI & Workflow

**Reports Tab:** New Control Center tab for report generation.

**Report Modal:**
1. Select report type
2. Configure scope (person, collection, date range, place filter)
3. Preview report
4. Generate as Markdown note or copy to clipboard

**Scope & Filtering:**
- Filter by person (ancestors/descendants of X)
- Filter by collection or universe
- Filter by date range
- Filter by place (events at location)
- Privacy toggle (anonymize living persons)

---

#### v1 Priorities

The first implementation will focus on:
1. **Family Group Sheet** — Most requested, good template for other reports
2. **Individual Summary** — Useful for all personas
3. **Ahnentafel Report** — Standard genealogy output

---

#### Future Report Types

These reports are under consideration for later phases:

| Report | Description |
|--------|-------------|
| **Hourglass Chart** | Ancestors + descendants from a focal person |
| **Fan Chart** | Circular ancestor display |
| **Surname Report** | All people sharing a surname |
| **Place Report** | All events/people at a location |
| **Research Log** | Sources consulted, findings, next steps |
| **Conflicting Evidence** | Facts with contradictory sources |
| **Gaps Report** | Missing vital records by generation |

See [Reports Planning Document](https://github.com/banisterious/obsidian-canvas-roots/blob/main/docs/planning/reports.md) for implementation details and output examples.

---

### Research & Analysis Tools

**Priority:** 📋 Medium — Analytics and tracking for serious researchers

**Family Statistics Dashboard:**
- Longevity analysis by generation/period
- Geographic distribution maps
- Most common names, occupations, places
- Generation gap analysis
- Marriage patterns

**Research Tracking:**
- "Needs research" tags with to-dos
- Confidence levels: verified, probable, possible
- Source documentation per fact
- DNA match tracking

**Dynasty Management:**
- Line of succession calculator
- Title/position inheritance
- Regnal numbering

---

### Transcript Nodes & Oral History

**Priority:** 💡 Low — Specialized for oral history researchers

**Summary:** Time-stamped citations from audio/video with direct linking.

**Schema:**
```yaml
oral_facts:
  - media: "[[Interview with Grandma.mp3]]"
    timestamp: "1m30s"
    fact_type: birth_date
    quote: "I was born on May 15th, 1922"
```

**Features:**
- Deep links with timestamp: `[[Interview.mp3]]#t=1m30s`
- Range support: `#t=1m30s-2m15s`
- One-click playback from timestamp
- Transcript nodes with speech bubble styling on canvas

**Interview Subject Graph:**
- Map relationship structure of interviews
- Interview as central hub node
- Edge thickness indicates mention frequency

---

## Future Considerations

These features are under consideration but not yet prioritized.

### Sensitive Field Redaction

Automatically redact sensitive personal information (SSN, identity numbers) from exports, regardless of living/deceased status. Currently, sensitive fields imported via GEDCOM v2 are stored but should never appear in exports.

### Data Analysis Scope Expansion

Expand Data Quality → Data Analysis scope options beyond folder-based filtering to include note type filtering:

**Current scope options:**
- All records (main tree)
- Staging folder only

**Proposed additions:**
- Filter by note type (Person, Place, Event, Source, etc.)
- Combined folder + note type filtering
- Note-type-specific validations (e.g., place notes check for missing coordinates, person notes check for missing birth date)

This requires generalizing the `DataQualityIssue` interface to support multiple note types instead of just `PersonNode`.

### Note Creation from Images

Context menu actions to create map or source notes from image files, pre-populating with image link.

### Person Note Templates

Pre-configured templates for different use cases: Researcher (full fields with sources), Casual User (minimal), World-Builder (with universe/fictional dates), Quick Add (bare minimum).

### Accessibility

- Screen reader support with ARIA labels
- High contrast mode
- Keyboard navigation
- WCAG AA compliance

### Obsidian Publish Support

Static HTML/SVG tree generation for Publish sites with privacy-aware export.

---

## Known Limitations

See [known-limitations.md](known-limitations.md) for complete details.

**Key Limitations:**
- Single vault only (no multi-vault merging)
- No undo/redo for Bases edits (platform limitation)
- No bulk operations from Bases multi-select (platform limitation)
- Privacy obfuscation for canvas display not yet implemented
- Interactive Canvas features limited by Obsidian Canvas API

### Context Menu Submenu Behavior

On desktop, submenus don't dismiss when hovering over a different submenu. This is a limitation of Obsidian's native `Menu` API. Potential solutions (flattening menus, modal dialogs, custom menu component) are under consideration based on user feedback.

---

## Contributing

We welcome feedback on feature priorities!

1. Check [existing issues](https://github.com/banisterious/obsidian-canvas-roots/issues)
2. Open a new issue with `feature-request` label
3. Describe your use case and why the feature would be valuable

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

---

**Questions?** Open an issue on [GitHub](https://github.com/banisterious/obsidian-canvas-roots/issues).
