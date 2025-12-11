# Settings UX Improvements Plan

## Overview

Audit of Control Center > Preferences tab and Plugin Settings revealed overlap, inconsistency, and usability issues. This plan addresses them in priority order.

## Issues Identified

### Overlap/Duplication
- Folder locations in both Preferences tab AND Plugin Settings
- Canvas layout/styling settings duplicated
- Date validation only in Preferences, not Plugin Settings

### Preferences Tab
- Dense "Property and value configuration" card
- Base files warning buried at bottom
- No visible count of configured aliases (property sections show total, not configured)
- Clear button subtle (opacity: 0.3)
- Date validation card placement seems misplaced

### Plugin Settings
- Long single page, no collapsibility
- Missing: spouse edge display, date validation
- Present but not in Preferences: privacy, research tools, note detection, export, logging
- Numeric inputs use text fields instead of proper number inputs
- Arbitrary section grouping

---

## Implementation Tasks

### Phase 1: Short-term (Low Effort) - COMPLETED

- [x] **1.1** Add cross-reference note in Plugin Settings pointing to Preferences tab
- [x] **1.2** Add collapsible sections to Plugin Settings using `<details>` elements
- [x] **1.3** Show "X configured" count on property alias sections (not just total)
- [x] **1.4** Change default `primaryTypeProperty` from `'type'` to `'cr_type'`

### Phase 2: Reduce Duplication - COMPLETED

- [x] **2.1** Decide authoritative location for each setting type:
  - **Plugin Settings**: Core behavior (bidirectional sync, privacy, logging, note detection, export, advanced)
  - **Preferences tab**: Personalization (folders, aliases, canvas styling, date validation)
- [x] **2.2** Remove canvas layout/styling from Plugin Settings (keep in Preferences)
- [x] **2.3** Remove folder settings from Plugin Settings (keep in Preferences)
- [x] **2.4** Cross-reference callout at top of Plugin Settings links to Preferences (done in Phase 1)

### Phase 3: Medium-term Improvements - COMPLETED

- [x] **3.1** Group related settings better in Plugin Settings (done in Phase 1):
  - Data & Detection (cr_id generation, note type detection, bidirectional sync)
  - Privacy & Export
  - Research Tools
  - Logging
  - Advanced (staging, folder filtering)
- [x] **3.2** Move Base files warning to more prominent position
- [x] **3.3** Improve clear button visibility in alias rows

### Phase 4: Longer-term Polish - COMPLETED

- [x] **4.1** Use slider component for numeric settings (node dimensions, spacing)
- [x] **4.2** Add folder picker autocomplete from existing vault folders
- [x] **4.3** Add settings search within Plugin Settings

---

## Files to Modify

- `src/settings.ts` - Plugin Settings tab
- `src/ui/preferences-tab.ts` - Control Center Preferences tab
- `styles/preferences.css` - Styling improvements

---

## Notes

- Changes should maintain backwards compatibility (settings values unchanged)
- Focus on discoverability and reducing confusion
- Avoid breaking existing workflows
