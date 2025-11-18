# Canvas Roots Plugin - Technical Specification

**Version:** 1.0
**Last Updated:** 2025-11-18
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Model](#2-data-model)
3. [Core Features](#3-core-features)
4. [Technical Implementation](#4-technical-implementation)
5. [GEDCOM Integration](#5-gedcom-integration)
6. [Enhanced Relationship Modeling](#6-enhanced-relationship-modeling)

---

## 1. Overview

### 1.1 Purpose

Canvas Roots is an Obsidian plugin that automates the creation and layout of complex family trees within Obsidian Canvas, using structured note data as the source and D3.js-based layout algorithms for positioning.

### 1.2 Key Differentiators

- **Native Canvas Integration:** Renders family trees as native Obsidian Canvas nodes and edges, not embedded visualizations
- **D3.js Layout Engine:** Leverages powerful graph layout algorithms for automatic positioning
- **Full Customization:** Users can manually adjust any node after automatic layout
- **Bidirectional Linking:** Maintains relationship consistency across all person notes
- **GEDCOM Compatibility:** Import and export standard genealogical data formats

### 1.3 Core Workflow

```
User creates person notes with relationship links
           ↓
User runs "Generate Tree" command on Canvas
           ↓
Plugin calculates D3 layout coordinates
           ↓
Plugin renders nodes/edges to Canvas JSON
           ↓
User views and customizes the family tree
```

---

## 2. Data Model

### 2.1 Person Note Schema

Each person in the family tree is represented by an individual Markdown note with YAML frontmatter or inline fields (Dataview compatible).

#### 2.1.1 Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `cr_id` | String (UUID) | **Yes** | Unique identifier for the person. Auto-generated on note creation. |
| `name` | String | No | Display name (defaults to file title) |
| `father` | [[Link]] | No | Link to father's note file |
| `mother` | [[Link]] | No | Link to mother's note file |
| `spouse` | [[Link]] or Array | No | Link(s) to spouse(s)/partner(s) |
| `children` | Array<[[Link]]> | No | Links to children's note files (auto-maintained by bidirectional linking) |
| `born` | Date | No | Birth date (see §6.4 for format details) |
| `died` | Date | No | Death date (see §6.4 for format details) |
| `cr_root` | Boolean | No | Marks person as tree center (optional filter) |

#### 2.1.2 Extended Properties (See §6)

Additional properties for complex genealogical data:
- Multiple spouse tracking with metadata (§6.1)
- Alternative parent relationships (§6.2)
- Unknown parent markers (§6.3)
- Flexible date formats (§6.4)
- Child ordering fields (§6.5)
- Grandparent direct links (§6.7)

### 2.2 Bidirectional Link Automation

**Requirement:** The plugin must automatically maintain inverse relationships when primary relationships are created or modified.

**Examples:**
- When `father: [[John Smith]]` is added to Jane's note → ensure `children: [[Jane Doe]]` exists in John's note
- When `spouse: [[Jane Doe]]` is added to John's note → ensure `spouse: [[John Smith]]` exists in Jane's note

**Implementation:** This feature is part of the MVP and must be implemented before 1.0 release.

---

## 3. Core Features

### 3.1 Tree Generation Command

**Command:** `Canvas Roots: Generate Tree for Current Note`

**Trigger Context:** User views a person note (the "root person")

**Actions:**
1. Recursively fetch all connected person notes (ancestors and descendants)
2. Extract relationship data from note properties
3. Build graph data structure
4. Calculate layout using D3.js algorithm
5. Generate Canvas JSON nodes and edges
6. Write to active Canvas file

### 3.2 Re-Layout Command

**Command:** `Canvas Roots: Re-Layout Current Canvas`

**Purpose:** Re-run layout calculation on existing Canvas nodes to snap them back to D3-calculated positions after manual rearrangement.

**Actions:**
1. Read existing Canvas JSON
2. Match Canvas nodes to person notes via file paths
3. Recalculate D3 layout positions
4. Update node coordinates without duplicating

### 3.3 Layout Algorithm

**Requirements:**
- Support multi-parent graphs (not simple trees)
- Handle complex relationships: siblings, multiple spouses, adoptive parents
- Produce non-overlapping layouts
- Similar to algorithms in family-chart library

**Coordinate System:**
- Calculate absolute positions via D3
- Apply viewport offset to center tree in current view
- Maintain consistent spacing between generations

---

## 4. Technical Implementation

### 4.1 Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| Obsidian API | Core plugin functionality | Latest |
| D3.js | Layout calculation | 7.x+ |
| TypeScript | Development language | 5.x+ |

### 4.2 Obsidian API Usage

**Required APIs:**
- `app.vault.read()` - Read Canvas JSON and note files
- `app.vault.write()` - Write Canvas JSON
- `app.vault.getAbstractFileByPath()` - Locate person notes
- `Notice` - User feedback/notifications
- `Plugin` - Core plugin class
- `Command` - Register commands

### 4.3 Canvas JSON Structure

The plugin reads and writes Obsidian's Canvas file format (`.canvas`):

```json
{
  "nodes": [
    {
      "id": "node-uuid-1",
      "x": 0,
      "y": 0,
      "width": 200,
      "height": 100,
      "type": "file",
      "file": "People/John Smith.md",
      "color": "6"
    },
    {
      "id": "node-uuid-2",
      "x": 50,
      "y": 150,
      "width": 50,
      "height": 30,
      "type": "text",
      "text": "&"
    }
  ],
  "edges": [
    {
      "id": "edge-uuid-3",
      "fromNode": "node-uuid-1",
      "fromSide": "bottom",
      "toNode": "node-uuid-4",
      "toSide": "top"
    }
  ]
}
```

**Node Types:**
- **File nodes:** Person cards (link to `.md` files)
- **Text nodes:** Marriage indicators (optional for MVP)

**Edge Properties:**
- Connect parent to child nodes
- Connect spouse nodes
- Side indicators control connection points

### 4.4 ID Mapping and Persistence

**Challenge:** Maintain stable identity across Canvas re-layouts

**Solution:**
1. **Stable ID:** Use `cr_id` from person note as primary key
2. **Transient ID:** Canvas `node.id` can change between layouts
3. **File Path Matching:** Match Canvas nodes to notes via `file` property
4. **Update Strategy:** Modify existing node positions, don't duplicate

**Coordinate Offset:**
- Calculate relative D3 positions
- Add offset based on current Canvas viewport center
- Ensure tree appears in visible area

---

## 5. GEDCOM Integration

### 5.1 Overview

GEDCOM (Genealogical Data Communication) is the industry standard format for family tree data exchange. Canvas Roots supports import and export.

### 5.2 Import Modes

#### Mode 1: Canvas Visualization (Quick Import)

**Purpose:** Rapid visualization without vault modification

**Process:**
1. Parse `.ged` file
2. Extract relationship data
3. Generate Canvas JSON directly
4. **Do not** create Markdown notes in vault

**Use Case:** Preview external family trees without cluttering vault

#### Mode 2: Vault Deep-Sync (Full Integration)

**Purpose:** Complete genealogical data integration

**Process:**
1. Parse `.ged` file completely
2. Create Markdown note for every:
   - Individual (person)
   - Place
   - Source
3. Populate YAML frontmatter with all GEDCOM fields
4. Establish bidirectional [[Link]] connections
5. Handle multimedia references and extended notes

**Use Case:** Migrate genealogical research into Obsidian vault

### 5.3 Export (Round-Trip)

**Command:** `Canvas Roots: Export to GEDCOM`

**Process:**
1. Find all notes containing `cr_id`
2. Extract person data from frontmatter
3. Generate valid `.ged` file
4. Preserve GEDCOM-specific fields for round-trip compatibility

**Purpose:** Allow users to export edited data back to dedicated genealogy software

### 5.4 Data Compatibility and Analysis

**Property Population:**
- All parsed GEDCOM fields stored in frontmatter/Properties
- Maximum compatibility with Dataview and Obsidian Bases
- Enable complex queries and analysis

**Analysis Queries:**

The plugin should provide utility functions and pre-built DataViewJS templates to enable rich data analysis:

**Example Query Templates:**
- "List all living descendants" - Find all people without `died` dates descended from a specific person
- "Table of individuals by age at death" - Calculate and sort lifespans
- "Source-linked individuals" - Show all people connected to specific historical sources
- "Geographic distribution" - Map individuals by birth/death locations
- "Sibling chain visualization" - Display extended sibling relationships and spouses of siblings

**Implementation:**
- Expose helper functions for common genealogical queries
- Provide template library accessible via command palette
- Support complex multi-table queries via Dataview integration
- Enable export of query results to Canvas or tables

### 5.5 Privacy and Data Obfuscation

**Requirement:** Protect personally identifiable information (PII) when sharing family trees publicly or for demonstrations.

#### 5.5.1 Obfuscation Modes

The plugin must support optional obfuscation during export and canvas rendering:

**Export Obfuscation:**
- Applied during GEDCOM export via export dialog option
- Original vault data remains completely intact
- Generate obfuscated `.ged` file for sharing

**Canvas Obfuscation:**
- Temporary display mode for screenshots/presentations
- Toggle via command: `Canvas Roots: Toggle Obfuscation Mode`
- Visual indicator when obfuscation is active
- Does not modify underlying notes

#### 5.5.2 Obfuscation Levels

| Level | Names | Dates | Locations | Notes/Research | Media |
|-------|-------|-------|-----------|----------------|-------|
| **None** | Original | Original | Original | Original | Original |
| **Minimal** | Original | Year only | Original | Original | Original |
| **Standard** | Anonymized | Year only | Region only | Stripped | Excluded |
| **Full** | Anonymized | Fuzzy ranges | Generic | Stripped | Excluded |

**Obfuscation Strategies:**

**Names:**
- **Pattern-based:** "Person A", "Person B", "Person C" (maintains readability)
- **Generated:** Use common placeholder names maintaining gender/cultural context
- **Relationship-based:** "Father of Person A", "Mother of Person B"

**Dates:**
- **Year only:** `1847-03-15` → `1847`
- **Decade:** `1847-03-15` → `1840s`
- **Fuzzy ranges:** `1847-03-15` → `circa 1845-1850`
- **Relative:** Maintain age differences and generation gaps

**Locations:**
- **Region only:** "Boston, Massachusetts, USA" → "Massachusetts, USA"
- **Country only:** "Boston, Massachusetts, USA" → "USA"
- **Generic:** "Boston, Massachusetts, USA" → "Urban area, Northeast USA"

**Research Notes:**
- **Strip all:** Remove all note content
- **Summarize:** "Has 3 sources, 2 media attachments"
- **Template:** Replace with placeholder text

**Media:**
- **Exclude links:** Remove all photo/document references
- **Placeholder:** Replace with generic avatar/document icon

#### 5.5.3 Obfuscation Mapping

**Mapping File Generation:**

When obfuscation is applied, optionally generate a JSON mapping file for reversing:

```json
{
  "obfuscation_date": "2025-11-18T15:30:00Z",
  "obfuscation_level": "standard",
  "mappings": {
    "Person A": "John Robert Smith",
    "Person B": "Mary Elizabeth Jones",
    "1847": "1847-03-15",
    "Massachusetts, USA": "Boston, Massachusetts, USA"
  }
}
```

**Security Considerations:**
- Mapping file stored locally only (never included in export)
- User prompted to store in secure location
- Optional encryption of mapping file
- Clear warning that mapping file is sensitive

#### 5.5.4 Structural Integrity

**What Must Be Preserved:**
- Relationship structure (parent-child, spouse connections)
- Relative chronology (birth order, generation gaps)
- `cr_id` values (needed for graph structure)
- Number of children, spouses, generations

**Validation:**
- Obfuscated export must remain valid GEDCOM
- Relationship logic must be testable/verifiable
- Canvas rendering must remain functional

#### 5.5.5 User Interface

**Export Dialog:**
```
┌─────────────────────────────────────────┐
│ Export to GEDCOM                        │
├─────────────────────────────────────────┤
│ Obfuscation Level:                      │
│ ○ None (full data)                      │
│ ○ Minimal (year only)                   │
│ ● Standard (names + dates)              │
│ ○ Full (maximum privacy)                │
│                                         │
│ ☑ Generate obfuscation mapping file    │
│ ☑ Include structural statistics only   │
│                                         │
│ [Cancel]              [Export GEDCOM]  │
└─────────────────────────────────────────┘
```

**Canvas Obfuscation Command:**
- Command palette: `Canvas Roots: Toggle Obfuscation Mode`
- Settings to set default obfuscation level
- Status bar indicator when active
- Automatic de-obfuscation on plugin reload

#### 5.5.6 Use Cases

**Public Sharing:**
- Share family tree structure on forums/blogs
- Demonstrate plugin functionality
- Educational examples in genealogy courses

**Collaboration:**
- Share with researchers who need structure, not PII
- Comply with privacy regulations (GDPR, etc.)
- Protect living individuals' information

**Development/Testing:**
- Create realistic test datasets
- Debug layout algorithms with real structure
- Share sample files with plugin developers

---

## 6. Enhanced Relationship Modeling

### 6.1 Multiple Spouse Support

**Requirement:** Support complex marital histories with temporal tracking

**Data Structure:**

```yaml
spouses:
  - person: "[[Jane Doe]]"
    marriage_date: "1985-06-15"
    divorce_date: "1992-03-20"
    marriage_status: divorced
    marriage_location: "[[Boston, MA]]"
  - person: "[[Mary Johnson]]"
    marriage_date: "1995-08-10"
    marriage_status: current
    marriage_location: "[[Seattle, WA]]"
```

**Legacy Support:** Continue accepting `spouse: [[Link]]` format

**Canvas Visualization:**
- Position multiple spouse nodes appropriately
- Visual indicators for marriage order/status
- Connect children to specific spousal relationships when applicable

### 6.2 Multiple and Alternative Parent Relationships

**Requirement:** Track biological, adoptive, step, foster, and guardian relationships

**Extended Fields:**

```yaml
biological_father: "[[John Smith]]"
biological_mother: "[[Jane Smith]]"
adoptive_father: "[[Robert Johnson]]"
adoptive_mother: "[[Susan Johnson]]"
step_father: "[[Michael Brown]]"
step_mother: "[[Lisa Brown]]"
foster_parents:
  - "[[David Wilson]]"
  - "[[Carol Wilson]]"
guardians:
  - "[[Thomas Anderson]]"
```

**Legacy Mapping:** `father` and `mother` default to biological parents

**Visual Differentiation:**
- Different edge styles for relationship types:
  - Solid lines: biological
  - Dashed lines: adoptive
  - Dotted lines: step-parents
  - Custom colors per relationship type
- Edge labels for clarity

**Settings:** Control which parent types display by default

### 6.3 Unknown or Missing Parent Handling

**Requirement:** Represent incomplete genealogical data clearly

**Data Markers:**

```yaml
father: unknown
mother: null
father_researching: true
mother_surname_only: "O'Brien"
```

**Canvas Placeholder Nodes:**
- Optional "Unknown Father" / "Unknown Mother" nodes
- Distinct visual styling (gray, dashed border)
- Settings toggle for show/hide

**Partial Parent Data:** Store limited information when available

### 6.4 Flexible Date Precision

**Requirement:** Handle varying levels of date precision in historical records

**Supported Formats:**

| Format | Example | Precision |
|--------|---------|-----------|
| `YYYY` | `1847` | Year only |
| `YYYY-MM` | `1847-03` | Year and month |
| `YYYY-MM-DD` | `1847-03-15` | Full date |
| `~YYYY` | `~1847` | Approximate year |
| `circa YYYY` | `circa 1847` | Approximate year |
| `YYYY/YYYY` | `1847/1848` | Date range |

**Display Formatting:**
- Render based on available precision
- Examples: "1847", "March 1847", "15 March 1847"

**Date Calculations:**
- Unknown month/day defaults to mid-year or mid-month
- Age calculations handle partial dates gracefully
- Comparison operations account for precision differences

**GEDCOM Compatibility:** Align with GEDCOM date standards

### 6.5 Child Ordering and Sibling Relationships

**Requirement:** Flexible organization of children within families

**Sorting Options:**

```yaml
# Manual ordering
birth_order: 3

# Automatic sort options (global setting):
# - sort_by_age (eldest to youngest)
# - sort_by_age_reverse (youngest to eldest)
# - alphabetical
# - custom_sort_field
```

**Settings:**
- Global default sort method
- Per-person override via frontmatter

**Canvas Layout:** D3 algorithm respects child ordering when positioning horizontally

**Sibling Relationships:**

```yaml
siblings:
  - "[[Thomas Anderson]]"
  - "[[Sarah Anderson]]"
```

**Use Case:** Document sibling connections when parent relationships are unknown

### 6.6 Customizable Canvas Card Display

**Requirement:** User control over canvas node appearance

**Display Settings:**

**Property Selection:**
- Configurable list of fields to display
- Drag-to-reorder interface
- Save as global default or per-template

**Conditional Display Rules:**
- Show `died` only if person is deceased
- Show age at death if both birth and death dates available
- Show location fields only when populated
- Show relationship type badges

**Card Layout Templates:**

| Template | Contents |
|----------|----------|
| **Compact** | Name and vital dates only |
| **Standard** | Name, dates, primary locations |
| **Detailed** | All configured properties |
| **Custom** | User-defined format with placeholders |

**Example Custom Template:**

```
{{name}}
b. {{born}} - d. {{died}}
{{birth_location}}
Age: {{age_at_death}}
```

**Per-Person Overrides:**

```yaml
cr_card_template: detailed
cr_card_color: "3"
```

### 6.7 Multi-Generational Gap Handling

**Requirement:** Handle missing intermediate generations in family trees

**Grandparent Direct Links:**

```yaml
# When parent records don't exist
grandfather_paternal: "[[James Smith]]"
grandmother_paternal: "[[Mary Smith]]"
grandfather_maternal: "[[John Doe]]"
grandmother_maternal: "[[Sarah Doe]]"
```

**Canvas Visualization:**
- Show multi-generational connection with visual indicator
- Optional placeholder generation for missing intermediate parents
- Distinct edge styling (e.g., dashed lines, different colors) for generational jumps

**Data Inference:**
- Option to automatically infer missing parent relationships
- Create placeholder nodes when grandparents exist but parents don't

**Settings Toggle:** User control over displaying inferred/placeholder relationships

---

## Appendix A: Implementation Priorities

### MVP (Minimum Viable Product)
- Core data model (§2.1.1)
- Bidirectional link automation (§2.2)
- Tree generation command (§3.1)
- Basic D3 layout
- Canvas JSON read/write (§4.3)

### Phase 2
- Re-layout command (§3.2)
- GEDCOM import Mode 1 (§5.2)
- Flexible date precision (§6.4)
- Basic card customization (§6.6)

### Phase 3
- GEDCOM import Mode 2 (§5.2)
- GEDCOM export (§5.3)
- Basic obfuscation (export only) (§5.5)
- Multiple spouse support (§6.1)
- Alternative parent relationships (§6.2)
- Unknown parent handling (§6.3)

### Phase 4
- Advanced obfuscation (canvas mode, all levels) (§5.5)
- Child ordering (§6.5)
- Advanced card templates (§6.6)
- Multi-generational gaps (§6.7)
- DataView template library (§5.4)

---

## Appendix B: Related Documentation

- **Architecture Overview:** [docs/architecture/overview.md](docs/architecture/overview.md)
- **Code Style Guide:** [docs/assets/templates/documentation-style-guide.md](docs/assets/templates/documentation-style-guide.md)
- **Original Spec (Archived):** [docs/archive/canvas-roots-initial-spec.md](docs/archive/canvas-roots-initial-spec.md)

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Canvas** | Obsidian's infinite canvas feature for visual organization |
| **D3.js** | JavaScript library for data visualization and layout algorithms |
| **GEDCOM** | Genealogical Data Communication - standard format for family tree data |
| **Frontmatter** | YAML metadata block at the top of Markdown files |
| **Dataview** | Popular Obsidian plugin for querying and displaying note metadata |
| **Bidirectional Link** | Reciprocal relationship links between two notes |
| **cr_id** | Canvas Roots unique identifier for each person |

---

**End of Specification**
