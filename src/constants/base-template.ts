/**
 * Obsidian Bases template for managing Canvas Roots family tree data
 */
export const BASE_TEMPLATE = `visibleProperties:
  - formula.display_name
  - note.father
  - note.mother
  - note.spouse
  - note.child
  - formula.birth_display
  - formula.death_display
  - note.gender
  - note.collection
  - note.group_name
  - note.root_person
summaries:
  generation_span: if(values.length > 0, values.max().year() - values.min().year(), 0)
filters:
  or:
    - file.hasTag("person")
    - file.hasProperty("cr_id")
formulas:
  display_name: name || file.name
  full_lifespan: if(born && died, died.year() - born.year() + " years", "")
  age_now: if(born && !died, now().year() - born.year(), "")
  birth_display: if(born, born.format("YYYY-MM-DD"), "")
  death_display: if(died, died.format("YYYY-MM-DD"), "")
properties:
  cr_id:
    displayName: ID
  formula.display_name:
    displayName: Name
  note.father:
    displayName: Father
  note.mother:
    displayName: Mother
  note.spouse:
    displayName: Spouse(s)
  note.child:
    displayName: Children
  formula.birth_display:
    displayName: Born
  formula.death_display:
    displayName: Died
  formula.full_lifespan:
    displayName: Lifespan
  formula.age_now:
    displayName: Age
  note.gender:
    displayName: Gender
  note.collection:
    displayName: Collection
  note.group_name:
    displayName: Group name
  note.root_person:
    displayName: Root person
  file.path:
    displayName: Location
views:
  - type: table
    name: All family members
    filters:
      and:
        - note.cr_id
    order:
      - born
      - file.name
      - father
      - mother
      - spouse
      - child
    summaries:
      born: Earliest
      died: Latest
      formula.full_lifespan: Average
  - type: table
    name: Living members
    filters:
      and:
        - note.cr_id
        - "!note.died"
    order:
      - born
    summaries:
      formula.age_now: Average
  - type: table
    name: Deceased members
    filters:
      and:
        - note.cr_id
        - note.died
    order:
      - died
    summaries:
      formula.full_lifespan: Average
      died: Latest
  - type: table
    name: Recently added
    filters:
      and:
        - note.cr_id
        - file.ctime > now() - '30 days'
    order:
      - file.ctime
    limit: 20
  - type: table
    name: Missing parents
    filters:
      and:
        - note.cr_id
        - "!note.father && !note.mother"
    order:
      - file.name
  - type: table
    name: Incomplete data
    filters:
      and:
        - note.cr_id
        - "!note.born || !note.name"
    order:
      - file.name
  - type: table
    name: By collection
    filters:
      and:
        - note.cr_id
        - note.collection
    order:
      - collection
      - file.name
    summaries:
      collection: Count
      born: Earliest
      died: Latest
  - type: table
    name: By family group
    filters:
      and:
        - note.cr_id
        - note.group_name
    order:
      - group_name
      - file.name
    summaries:
      group_name: Count
      born: Earliest
      died: Latest
  - type: table
    name: Unassigned collections
    filters:
      and:
        - note.cr_id
        - "!note.collection"
    order:
      - file.name
  - type: table
    name: Single parents
    filters:
      and:
        - note.cr_id
        - note.child
        - "!note.spouse"
    order:
      - file.name
    summaries:
      child: Count
  - type: table
    name: Childless couples
    filters:
      and:
        - note.cr_id
        - note.spouse
        - "!note.child"
    order:
      - file.name
  - type: table
    name: Multiple marriages
    filters:
      and:
        - note.cr_id
        - note.spouse
    order:
      - file.name
  - type: table
    name: Sibling groups
    filters:
      and:
        - note.cr_id
        - note.father
    order:
      - father
      - mother
      - born
    summaries:
      father: Count
  - type: table
    name: Root generation
    filters:
      and:
        - note.cr_id
        - "!note.father && !note.mother"
    order:
      - born
    summaries:
      child: Count
  - type: table
    name: Marked root persons
    filters:
      and:
        - note.cr_id
        - note.root_person = true
    order:
      - born
    summaries:
      child: Count
`;
