# Reports & Print Export

## Overview

Generate structured reports and print-ready outputs for genealogists, writers, worldbuilders, and historians. Reports are saved as Markdown notes with wikilinks for seamless integration with Obsidian's linking and search.

See [Roadmap: Reports & Print Export](../../wiki-content/Roadmap.md#reports--print-export) for the user-facing summary.

---

## Report Types by Persona

### Genealogy Reports

| Report | Description | Data Required | Priority |
|--------|-------------|---------------|----------|
| **Family Group Sheet** | Single family unit: couple + children with dates, places, sources | Person notes, relationships | v1 |
| **Individual Summary** | All known facts for one person with source citations | Person, events, sources | v1 |
| **Ahnentafel Report** | Numbered ancestor list (1=subject, 2=father, 3=mother, etc.) | Person notes, relationships | v1 |
| **Register Report** | Descendants with genealogical numbering (NGSQ style) | Person notes, relationships | v2 |
| **Pedigree Chart** | Ancestor tree, 4-5 generations per page | Person notes, relationships | v2 |
| **Descendant Chart** | All descendants of an ancestor | Person notes, relationships | v2 |
| **Hourglass Chart** | Ancestors + descendants from a focal person | Person notes, relationships | Future |
| **Fan Chart** | Circular ancestor display | Person notes, relationships | Future |
| **Surname Report** | All people sharing a surname | Person notes | Future |
| **Place Report** | All events/people at a location | Events, places | Future |

### Creative Writing Reports

| Report | Description | Data Required | Priority |
|--------|-------------|---------------|----------|
| **Character Arc** | Single character's journey: events, relationships formed/lost | Person, events | v2 |
| **Scene Outline** | Events organized by chapter/book with POV, setting, participants | Events with book/chapter | v2 |
| **POV Coverage** | Which events are witnessed by which POV characters | Events with POV field | v2 |
| **Subplot Timeline** | Events filtered by group tag with arc status and intersections | Events with groups | v2 |
| **Appearances by Book** | Character presence across volumes in a series | Events with book field | v2 |

### Worldbuilding Reports

| Report | Description | Data Required | Priority |
|--------|-------------|---------------|----------|
| **Character Sheet** | Single character with relationships, events, affiliations | Person, events, orgs | v2 |
| **Cast List** | All characters filtered by universe/collection/faction | Person notes, collections | v2 |
| **Organization Roster** | Members of a faction/guild/house with roles and dates | Org notes, memberships | v2 |
| **Faction Timeline** | Events filtered by group tag | Events with groups | v2 |
| **Age Audit** | Characters' ages at key story dates (catch anachronisms) | Person birth dates, events | v2 |
| **Lifespan Overlap** | Which characters could have met? Matrix of overlapping lifetimes | Person birth/death dates | v2 |

### Historian Reports

| Report | Description | Data Required | Priority |
|--------|-------------|---------------|----------|
| **Source Bibliography** | All sources with full citations, grouped by type | Source notes | v2 |
| **Evidence Matrix** | Facts vs. sources grid showing which sources support which claims | Events, sources | v2 |
| **Cohort Analysis** | People sharing characteristics (occupation, location, time period) | Person notes | Future |
| **Prosopography** | Collective biography of a defined group | Person notes, collections | Future |

### Research Reports

| Report | Description | Data Required | Priority |
|--------|-------------|---------------|----------|
| **Research Log** | Sources consulted, findings, next steps | Sources, proof summaries | Future |
| **Conflicting Evidence** | Facts with contradictory sources | Events, sources | Future |
| **Gaps Report** | Missing vital records by generation | Person notes | Future |

---

## Data Model Considerations

### Existing Fields (No Changes Needed)

These reports work with the current data model:

- Family Group Sheet, Individual Summary, Ahnentafel, Register, Pedigree, Descendant
- Character Sheet, Cast List, Organization Roster, Faction Timeline
- Age Audit, Lifespan Overlap
- Source Bibliography, Evidence Matrix
- Character Arc (uses events filtered by person)
- Subplot Timeline (uses `groups` field on events)

### Optional Schema Extensions

These fields would enhance certain reports but are not required:

| Field | On Entity | Used By | Notes |
|-------|-----------|---------|-------|
| `book` | Event | Scene Outline, Appearances by Book | Book/volume identifier |
| `chapter` | Event | Scene Outline | Chapter number or name |
| `pov_character` | Event | POV Coverage | Which character "sees" this event |
| `arc_status` | Group/Event | Subplot Timeline | setup / rising / climax / resolution |

Users who don't need these reports don't need these fields. Reports gracefully degrade when fields are absent.

---

## Report Output Examples

### Family Group Sheet

```markdown
# Smith-Jones Family

## Parents

### John Robert Smith (1888-1952)
- **Born:** 15 May 1888, [[Dublin, Ireland]]
- **Died:** 20 Aug 1952, [[Boston, Massachusetts]]
- **Occupation:** Carpenter
- **Sources:** [[1888 Birth Certificate]], [[1920 Census]]

### Mary Elizabeth Jones (1892-1975)
- **Born:** 3 Mar 1892, [[Cork, Ireland]]
- **Died:** 12 Nov 1975, [[Boston, Massachusetts]]
- **Sources:** [[1892 Birth Certificate]]

## Marriage
- **Date:** 14 Jun 1912
- **Place:** [[St. Patrick's Church, Dublin]]
- **Sources:** [[1912 Marriage Record]]

## Children

| # | Name | Born | Died | Spouse |
|---|------|------|------|--------|
| 1 | [[Thomas John Smith]] | 1913 | 1985 | [[Sarah Williams]] |
| 2 | [[Margaret Mary Smith]] | 1915 | 2001 | [[Patrick O'Brien]] |
| 3 | [[William James Smith]] | 1918 | 1944 | — |

---
*Generated by Canvas Roots on 2025-12-09*
```

### Character Arc Report

```markdown
# Character Arc: Frodo Baggins

## Summary
- **First appearance:** TA 3001 (Bilbo's Birthday Party)
- **Last appearance:** TA 3021 (Departs to Valinor)
- **Arc span:** 20 years
- **Total events:** 47

## Key Relationships

### Formed
| Character | Relationship | First Event |
|-----------|--------------|-------------|
| [[Sam]] | companion | TA 3018 - [[Leaves the Shire]] |
| [[Gollum]] | captor/guide | TA 3019 - [[Captured by Gollum]] |

### Changed/Lost
| Character | Relationship | Event |
|-----------|--------------|-------|
| [[Gandalf]] | mentor | TA 3019 - [[Falls in Moria]] |
| [[Bilbo]] | uncle | TA 3021 - [[Departs together]] |

## Timeline

### TA 3001
- [[Bilbo's Birthday Party]] - Inherits Bag End and the Ring

### TA 3018
- [[Leaves the Shire]] - Begins journey with Sam, Merry, Pippin
- [[Council of Elrond]] - Volunteers to bear the Ring

### TA 3019
- [[Fellowship departs Rivendell]]
- [[Falls in Moria]] - Witnesses Gandalf's fall
- [[Breaking of the Fellowship]] - Departs alone with Sam
...

## Arc Analysis
- **Events by type:** 12 plot_point, 8 residence, 15 anecdote
- **Locations visited:** Shire → Rivendell → Moria → Lothlórien → ...
- **Affiliations:** Fellowship (TA 3018-3019), Ring-bearer

---
*Generated by Canvas Roots on 2025-12-09*
```

### Subplot Timeline Report

```markdown
# Subplot: Ring Quest

**Arc Status:** Resolved
**Date Range:** TA 3001 - TA 3019

## Timeline

| Date | Event | Characters | Status |
|------|-------|------------|--------|
| TA 3001 | [[Frodo receives the Ring]] | Frodo, Gandalf | Setup |
| TA 3018 | [[Council of Elrond]] | Frodo, Gandalf, Aragorn, Legolas, Gimli, Boromir | Rising |
| TA 3019 | [[Breaking of the Fellowship]] | All Fellowship | Rising |
| TA 3019 | [[Ring destroyed]] | Frodo, Sam, Gollum | Climax/Resolution |

## Intersecting Subplots
- **Shire** (3 shared events)
- **Gondor Succession** (2 shared events)
- **Rohan Defense** (1 shared event)

## Characters Involved
- [[Frodo Baggins]] (15 events)
- [[Samwise Gamgee]] (12 events)
- [[Gandalf]] (8 events)
- [[Gollum]] (6 events)

---
*Generated by Canvas Roots on 2025-12-09*
```

### Appearances by Book Report

```markdown
# Character Appearances by Book

## The Fellowship of the Ring

| Character | Events | First Appearance | Last Appearance |
|-----------|--------|------------------|-----------------|
| [[Frodo Baggins]] | 34 | Ch 1 - A Long-expected Party | Ch 10 - Breaking |
| [[Gandalf]] | 28 | Ch 1 - A Long-expected Party | Ch 5 - Bridge |
| [[Aragorn]] | 18 | Ch 10 - Strider | Ch 10 - Breaking |
| [[Boromir]] | 12 | Ch 2 - Council of Elrond | Ch 10 - Breaking |

## The Two Towers

| Character | Events | First Appearance | Last Appearance |
|-----------|--------|------------------|-----------------|
| [[Frodo Baggins]] | 22 | Ch 1 - Taming of Sméagol | Ch 10 - Choices |
| [[Gandalf]] | 15 | Ch 5 - The White Rider | Ch 8 - Road to Isengard |
| [[Aragorn]] | 20 | Ch 1 - Departure of Boromir | Ch 7 - Helm's Deep |

## Character Continuity

| Character | Book 1 | Book 2 | Book 3 | Total |
|-----------|--------|--------|--------|-------|
| [[Frodo Baggins]] | ✓ (34) | ✓ (22) | ✓ (18) | 74 |
| [[Gandalf]] | ✓ (28) | ✓ (15) | ✓ (25) | 68 |
| [[Boromir]] | ✓ (12) | ✓ (1) | — | 13 |
| [[Éowyn]] | — | ✓ (8) | ✓ (12) | 20 |

## New Characters by Book
- **Book 1:** Frodo, Gandalf, Sam, Merry, Pippin, Aragorn, Legolas, Gimli, Boromir
- **Book 2:** Éomer, Éowyn, Théoden, Faramir, Gollum, Treebeard
- **Book 3:** Denethor, Prince Imrahil

---
*Generated by Canvas Roots on 2025-12-09*
```

### POV Coverage Report

```markdown
# POV Coverage Report

## Events by POV Character

| POV Character | Events | % of Total |
|---------------|--------|------------|
| [[Frodo Baggins]] | 45 | 38% |
| [[Aragorn]] | 32 | 27% |
| [[Merry]] | 18 | 15% |
| [[Pippin]] | 15 | 13% |
| [[Sam]] | 8 | 7% |

## Unwitnessed Events

These events happen "offstage" (no POV character present):

| Date | Event | Characters Present |
|------|-------|-------------------|
| TA 3019 | [[Ents attack Isengard]] | Treebeard, Ents |
| TA 3019 | [[Denethor's madness]] | Denethor (alone) |

## Events with Multiple POVs

| Event | POV Characters |
|-------|----------------|
| [[Council of Elrond]] | Frodo, Aragorn |
| [[Battle of Helm's Deep]] | Aragorn, Merry |

---
*Generated by Canvas Roots on 2025-12-09*
```

---

## Output Formats

### Markdown (Primary)

- Standard output format
- Contains wikilinks for Obsidian integration
- Embeddable in other notes
- Searchable and linkable

### PDF (via Browser Print)

- Reports include print-optimized CSS
- Users print via Ctrl/Cmd+P → Save as PDF
- Clean layout with hidden navigation elements
- Page breaks at logical sections

### Dataview Query (Dynamic)

Instead of a static snapshot, generate a Dataview query that produces the report dynamically:

```markdown
## Family Group Sheet: Smith-Jones

```dataview
TABLE
  born as "Born",
  died as "Died",
  birthPlace as "Birthplace"
FROM "People"
WHERE father = [[John Smith]] OR mother = [[Mary Jones]]
SORT born ASC
```
```

---

## UI Design

### Reports Tab

New Control Center tab between Events and Import/Export:

```
┌─────────────────────────────────────────┐
│ Reports                                 │
├─────────────────────────────────────────┤
│                                         │
│ Generate reports                        │
│ ─────────────────────────────────────── │
│                                         │
│ Report type: [Family Group Sheet ▼]     │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Scope                                   │
│ Root person: [Select person... ▼]       │
│ Direction: ○ Ancestors ○ Descendants    │
│ Generations: [4 ▼]                      │
│                                         │
│ Filters                                 │
│ Collection: [All ▼]                     │
│ Date range: [____] to [____]            │
│ ☐ Anonymize living persons              │
│                                         │
│ Output                                  │
│ Format: ○ Markdown ○ Dataview Query     │
│ Folder: [Reports ▼]                     │
│                                         │
│ [Preview]  [Generate Report]            │
│                                         │
└─────────────────────────────────────────┘
```

### Report Preview Modal

```
┌─────────────────────────────────────────┐
│ Preview: Family Group Sheet             │
├─────────────────────────────────────────┤
│                                         │
│ # Smith-Jones Family                    │
│                                         │
│ ## Parents                              │
│                                         │
│ ### John Robert Smith (1888-1952)       │
│ - **Born:** 15 May 1888, Dublin...      │
│                                         │
│ [scrollable preview content]            │
│                                         │
├─────────────────────────────────────────┤
│ Stats: 2 parents, 3 children, 8 sources │
│                                         │
│   [Copy to Clipboard]  [Create Note]    │
└─────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1 (v1)

**Focus:** Core genealogy reports that are most requested and establish patterns.

1. **Family Group Sheet**
   - Select a couple or individual
   - Show spouse(s), children with basic vitals
   - Include source citations

2. **Individual Summary**
   - All known facts for one person
   - Events in chronological order
   - Source citations per fact

3. **Ahnentafel Report**
   - Numbered ancestor list
   - Configurable generation depth
   - Standard genealogical format

**Infrastructure:**
- Report generation service
- Markdown templating system
- Reports tab in Control Center
- Preview modal

### Phase 2

**Focus:** Expand to worldbuilding, creative writing, and historian use cases.

- Character Sheet, Cast List, Organization Roster
- Character Arc, Scene Outline, POV Coverage
- Source Bibliography, Evidence Matrix
- Faction Timeline, Age Audit, Lifespan Overlap
- Register Report, Pedigree/Descendant Charts

### Future

- Hourglass Chart, Fan Chart
- Surname Report, Place Report
- Research Log, Conflicting Evidence, Gaps Report
- Cohort Analysis, Prosopography

---

## Technical Considerations

### Report Generator Architecture

```typescript
interface ReportGenerator<TOptions, TResult> {
  readonly id: string;
  readonly name: string;
  readonly category: 'genealogy' | 'worldbuilding' | 'writing' | 'historian';

  getDefaultOptions(): TOptions;
  validate(options: TOptions): ValidationResult;
  generate(options: TOptions): Promise<TResult>;
  toMarkdown(result: TResult): string;
  toDataviewQuery?(result: TResult): string;
}

// Example: Family Group Sheet
class FamilyGroupSheetGenerator implements ReportGenerator<FGSOptions, FGSResult> {
  // ...
}
```

### Leveraging Existing Services

| Service | Reports Using It |
|---------|-----------------|
| `FamilyGraphService` | Family Group Sheet, Ahnentafel, Pedigree, Descendant |
| `EventGraphService` | Individual Summary, Character Arc, Timelines |
| `SourceGraphService` | Source Bibliography, Evidence Matrix |
| `PlaceGraphService` | Place Report |
| `OrgGraphService` | Organization Roster |

### Print CSS

```css
@media print {
  /* Hide Obsidian UI */
  .workspace-ribbon,
  .workspace-tab-header-container,
  .status-bar { display: none; }

  /* Page breaks */
  .cr-report-section { page-break-inside: avoid; }
  .cr-report-page-break { page-break-after: always; }

  /* Clean typography */
  .cr-report { font-family: Georgia, serif; }
  .cr-report h1 { font-size: 24pt; }
  .cr-report table { font-size: 10pt; }
}
```

---

## Related Documentation

- [Roadmap: Reports & Print Export](../../wiki-content/Roadmap.md#reports--print-export)
- [Events & Timelines](../../wiki-content/Events-And-Timelines.md)
- [Evidence & Sources](../../wiki-content/Evidence-And-Sources.md)
- [Organization Notes](../../wiki-content/Organization-Notes.md)
