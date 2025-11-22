/**
 * Obsidian Bases template for managing Canvas Roots family tree data
 */
export const BASE_TEMPLATE = `# Canvas Roots - Family Members Base Template
#
# This base provides table views for managing family tree data.
# Copy this file to your vault and customize as needed.
#
# Learn more: https://github.com/banisterious/obsidian-canvas-roots

filters:
  or:
    - file.hasTag("person")
    - file.hasProperty("cr_id")

formulas:
  # Display the person's full name or fallback to filename
  display_name: 'name || file.name'

  # Calculate lifespan if both dates are present
  full_lifespan: 'if(born && died, died.year() - born.year() + " years", "")'

  # Calculate current age if born but not died
  age_now: 'if(born && !died, now().year() - born.year(), "")'

  # Format birth date for display
  birth_display: 'if(born, born.format("YYYY-MM-DD"), "")'

  # Format death date for display
  death_display: 'if(died, died.format("YYYY-MM-DD"), "")'

properties:
  cr_id:
    displayName: "ID"
  formula.display_name:
    displayName: "Name"
  note.father:
    displayName: "Father"
  note.mother:
    displayName: "Mother"
  note.spouse:
    displayName: "Spouse(s)"
  note.child:
    displayName: "Children"
  formula.birth_display:
    displayName: "Born"
  formula.death_display:
    displayName: "Died"
  formula.full_lifespan:
    displayName: "Lifespan"
  formula.age_now:
    displayName: "Age"
  note.gender:
    displayName: "Gender"
  file.path:
    displayName: "Location"

summaries:
  # Custom summary to show generation span
  generation_span: 'if(values.length > 0, values.max().year() - values.min().year(), 0)'

views:
  # Default view: All family members ordered by birth date
  - type: table
    name: "All Family Members"
    order:
      - note.born
      - file.name
    filters:
      and:
        - "note.cr_id"  # Only show notes with cr_id
    summaries:
      note.born: Earliest
      note.died: Latest
      formula.full_lifespan: Average

  # Living members only
  - type: table
    name: "Living Members"
    filters:
      and:
        - "note.cr_id"
        - "!note.died"  # No death date
    order:
      - note.born
    summaries:
      formula.age_now: Average

  # Deceased members only
  - type: table
    name: "Deceased Members"
    filters:
      and:
        - "note.cr_id"
        - "note.died"  # Has death date
    order:
      - note.died
    summaries:
      formula.full_lifespan: Average
      note.died: Latest

  # Recent additions (last 30 days)
  - type: table
    name: "Recently Added"
    filters:
      and:
        - "note.cr_id"
        - "file.ctime > now() - '30 days'"
    order:
      - file.ctime
    limit: 20

  # Members without parents defined
  - type: table
    name: "Missing Parents"
    filters:
      and:
        - "note.cr_id"
        - "!note.father && !note.mother"
    order:
      - file.name

  # Members without complete data
  - type: table
    name: "Incomplete Data"
    filters:
      and:
        - "note.cr_id"
        - "!note.born || !note.name"
    order:
      - file.name
`;
