/**
 * Template Snippets Modal
 * Provides copyable Templater-compatible templates for Canvas Roots note types
 */

import { App, Modal, Notice } from 'obsidian';
import { createLucideIcon } from './lucide-icons';

type TemplateType = 'person' | 'place' | 'source' | 'organization' | 'proof';

interface TemplateSnippet {
	name: string;
	description: string;
	template: string;
}

/**
 * Modal displaying copyable template snippets for Templater
 */
export class TemplateSnippetsModal extends Modal {
	private selectedType: TemplateType = 'person';

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Add modal class for styling
		this.modalEl.addClass('crc-template-snippets-modal');

		// Header
		const header = contentEl.createDiv({ cls: 'crc-modal-header' });
		const titleContainer = header.createDiv({ cls: 'crc-modal-title' });
		const icon = createLucideIcon('file-code', 24);
		titleContainer.appendChild(icon);
		titleContainer.appendText('Templater templates');

		// Description
		contentEl.createEl('p', {
			text: 'Copy these templates into your Templater template files. They use Templater syntax for dynamic values.',
			cls: 'crc-text--muted'
		});

		// Tab selector
		const tabContainer = contentEl.createDiv({ cls: 'crc-template-tabs' });

		const tabs: Array<{ type: TemplateType; label: string; el?: HTMLButtonElement }> = [
			{ type: 'person', label: 'Person' },
			{ type: 'place', label: 'Place' },
			{ type: 'source', label: 'Source' },
			{ type: 'organization', label: 'Organization' },
			{ type: 'proof', label: 'Proof summary' }
		];

		for (const tab of tabs) {
			tab.el = tabContainer.createEl('button', {
				text: tab.label,
				cls: `crc-template-tab${tab.type === 'person' ? ' crc-template-tab--active' : ''}`
			});
		}

		// Template content container
		const templateContainer = contentEl.createDiv({ cls: 'crc-template-container' });

		// Tab switching
		for (const tab of tabs) {
			tab.el?.addEventListener('click', () => {
				this.selectedType = tab.type;
				for (const t of tabs) {
					t.el?.removeClass('crc-template-tab--active');
				}
				tab.el?.addClass('crc-template-tab--active');
				this.renderTemplates(templateContainer);
			});
		}

		// Initial render
		this.renderTemplates(templateContainer);

		// Variable reference section
		const referenceSection = contentEl.createDiv({ cls: 'crc-template-reference crc-mt-4' });
		referenceSection.createEl('h4', { text: 'Templater variable reference', cls: 'crc-mb-2' });

		const referenceContent = referenceSection.createDiv({ cls: 'crc-template-reference-content' });
		this.renderVariableReference(referenceContent);

		// Schema documentation link
		const schemaSection = contentEl.createDiv({ cls: 'crc-template-schema-link crc-mt-3' });
		const schemaNote = schemaSection.createEl('p', { cls: 'crc-text--muted' });
		schemaNote.appendText('These templates include common fields. For the complete list of supported frontmatter properties, see the ');
		const schemaLink = schemaNote.createEl('a', {
			text: 'Frontmatter schema reference',
			cls: 'crc-link',
			href: 'https://github.com/banisterious/obsidian-canvas-roots/blob/main/docs/reference/frontmatter-schema.md'
		});
		schemaLink.setAttribute('target', '_blank');
		schemaNote.appendText('.');

		// Close button
		const buttonContainer = contentEl.createDiv({ cls: 'crc-modal-buttons crc-mt-4' });
		const closeBtn = buttonContainer.createEl('button', {
			text: 'Close',
			cls: 'crc-btn'
		});
		closeBtn.addEventListener('click', () => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Render templates for the selected type
	 */
	private renderTemplates(container: HTMLElement): void {
		container.empty();

		let templates: TemplateSnippet[];
		switch (this.selectedType) {
			case 'person':
				templates = this.getPersonTemplates();
				break;
			case 'place':
				templates = this.getPlaceTemplates();
				break;
			case 'source':
				templates = this.getSourceTemplates();
				break;
			case 'organization':
				templates = this.getOrganizationTemplates();
				break;
			case 'proof':
				templates = this.getProofTemplates();
				break;
		}

		for (const template of templates) {
			const templateCard = container.createDiv({ cls: 'crc-template-card' });

			// Header
			const cardHeader = templateCard.createDiv({ cls: 'crc-template-card-header' });
			cardHeader.createEl('h4', { text: template.name });
			cardHeader.createEl('p', { text: template.description, cls: 'crc-text--muted' });

			// Code block with copy button
			const codeWrapper = templateCard.createDiv({ cls: 'crc-template-code-wrapper' });

			const codeBlock = codeWrapper.createEl('pre', { cls: 'crc-template-code' });
			codeBlock.createEl('code', { text: template.template });

			const copyBtn = codeWrapper.createEl('button', {
				cls: 'crc-template-copy-btn',
				attr: { 'aria-label': 'Copy template' }
			});
			const copyIcon = createLucideIcon('copy', 16);
			copyBtn.appendChild(copyIcon);

			copyBtn.addEventListener('click', () => {
				void (async () => {
					try {
						await navigator.clipboard.writeText(template.template);
						new Notice('Template copied to clipboard');

						// Visual feedback
						copyBtn.empty();
						const checkIcon = createLucideIcon('check', 16);
						copyBtn.appendChild(checkIcon);
						copyBtn.addClass('crc-template-copy-btn--success');

						setTimeout(() => {
							copyBtn.empty();
							copyBtn.appendChild(createLucideIcon('copy', 16));
							copyBtn.removeClass('crc-template-copy-btn--success');
						}, 2000);
					} catch {
						new Notice('Failed to copy template');
					}
				})();
			});
		}
	}

	/**
	 * Render the Templater variable reference
	 */
	private renderVariableReference(container: HTMLElement): void {
		const variables = [
			{ syntax: '<% tp.date.now("YYYYMMDDHHmmss") %>', description: 'Timestamp-based unique ID (for cr_id)' },
			{ syntax: '<% tp.file.title %>', description: 'Current file name (for name field)' },
			{ syntax: '<% tp.date.now("YYYY-MM-DD") %>', description: 'Today\'s date (for born/died fields)' },
			{ syntax: '<% tp.file.cursor() %>', description: 'Place cursor here after template insertion' },
			{ syntax: '<% tp.system.prompt("Question?") %>', description: 'Prompt user for input' },
			{ syntax: '<% tp.system.suggester(["opt1", "opt2"], ["val1", "val2"]) %>', description: 'Show selection dialog' }
		];

		const table = container.createEl('table', { cls: 'crc-template-table' });

		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		headerRow.createEl('th', { text: 'Syntax' });
		headerRow.createEl('th', { text: 'Description' });

		const tbody = table.createEl('tbody');
		for (const v of variables) {
			const row = tbody.createEl('tr');
			const syntaxCell = row.createEl('td');
			syntaxCell.createEl('code', { text: v.syntax, cls: 'crc-template-var' });
			row.createEl('td', { text: v.description });
		}
	}

	/**
	 * Get person note templates
	 */
	private getPersonTemplates(): TemplateSnippet[] {
		return [
			{
				name: 'Basic person note',
				description: 'Minimal template with essential fields',
				template: `---
type: person
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
sex: <% tp.system.suggester(["Male", "Female", "Unknown"], ["M", "F", "U"]) %>
born:
died:
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			},
			{
				name: 'Full person note',
				description: 'Complete template with family relationships and place fields',
				template: `---
type: person
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
sex: <% tp.system.suggester(["Male", "Female", "Unknown"], ["M", "F", "U"]) %>

# Dates
born:
died:

# Family relationships
father:
father_id:
mother:
mother_id:
spouse1:
spouse1_id:
spouse1_marriage_date:
spouse1_marriage_location:

# Places
birth_place:
death_place:
burial_place:

# Organization
collection:
---

# <% tp.file.title %>

## Biography

<% tp.file.cursor() %>

## Notes

`
			},
			{
				name: 'Person with prompts',
				description: 'Interactive template that prompts for key information',
				template: `---
type: person
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
sex: <% tp.system.suggester(["Male", "Female", "Unknown"], ["M", "F", "U"]) %>
born: <% tp.system.prompt("Birth date (YYYY-MM-DD)?", "", false) %>
died: <% tp.system.prompt("Death date (YYYY-MM-DD)? Leave blank if living", "", false) %>
birth_place: "<% tp.system.prompt("Birth place?", "", false) %>"
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			}
		];
	}

	/**
	 * Get place note templates
	 */
	private getPlaceTemplates(): TemplateSnippet[] {
		return [
			{
				name: 'Basic place note',
				description: 'Minimal template for real-world locations',
				template: `---
type: place
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
place_type: <% tp.system.suggester(["City", "Town", "Village", "Country", "State/Province", "Region", "County"], ["city", "town", "village", "country", "state", "region", "county"]) %>
parent_place:
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			},
			{
				name: 'Place with coordinates',
				description: 'For real-world locations with geographic coordinates',
				template: `---
type: place
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
place_category: real
place_type: <% tp.system.suggester(["City", "Town", "Village", "Country", "State/Province", "Region", "County"], ["city", "town", "village", "country", "state", "region", "county"]) %>
parent_place:
coordinates:
  lat: <% tp.system.prompt("Latitude?", "", false) %>
  long: <% tp.system.prompt("Longitude?", "", false) %>
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			},
			{
				name: 'Historical place',
				description: 'For places that no longer exist or have changed significantly',
				template: `---
type: place
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
place_category: historical
place_type: <% tp.system.suggester(["City", "Town", "Village", "Country", "State/Province", "Region", "Kingdom", "Empire"], ["city", "town", "village", "country", "state", "region", "kingdom", "empire"]) %>
parent_place:
historical_names:
  - name:
    period:
---

# <% tp.file.title %>

## History

<% tp.file.cursor() %>`
			},
			{
				name: 'Fictional place',
				description: 'For world-building and fictional locations',
				template: `---
type: place
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
place_category: fictional
universe: "<% tp.system.prompt("Universe/World name?", "", false) %>"
place_type: <% tp.system.suggester(["City", "Town", "Village", "Country", "Kingdom", "Region", "Castle", "Fortress", "Island"], ["city", "town", "village", "country", "kingdom", "region", "castle", "fortress", "island"]) %>
parent_place:
custom_coordinates:
  x:
  y:
  map:
---

# <% tp.file.title %>

## Description

<% tp.file.cursor() %>

## Notable inhabitants

`
			},
			{
				name: 'Full place note',
				description: 'Complete template with all available fields',
				template: `---
type: place
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
aliases:
  -
place_category: <% tp.system.suggester(["Real", "Historical", "Disputed", "Legendary", "Mythological", "Fictional"], ["real", "historical", "disputed", "legendary", "mythological", "fictional"]) %>
universe:
place_type: <% tp.system.suggester(["City", "Town", "Village", "Country", "State/Province", "Region", "County", "Kingdom", "Castle"], ["city", "town", "village", "country", "state", "region", "county", "kingdom", "castle"]) %>
parent_place:
coordinates:
  lat:
  long:
custom_coordinates:
  x:
  y:
  map:
historical_names:
  - name:
    period:
collection:
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			}
		];
	}

	/**
	 * Get source note templates
	 */
	private getSourceTemplates(): TemplateSnippet[] {
		return [
			{
				name: 'Basic source note',
				description: 'Minimal template for documenting a source',
				template: `---
type: source
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
source_type: <% tp.system.suggester(["Census", "Vital record", "Church record", "Newspaper", "Photo", "Correspondence", "Military", "Court record", "Land deed", "Probate", "Immigration", "Obituary", "Oral history"], ["census", "vital_record", "church_record", "newspaper", "photo", "correspondence", "military", "court_record", "land_deed", "probate", "immigration", "obituary", "oral_history"]) %>
source_date:
confidence: <% tp.system.suggester(["High", "Medium", "Low", "Unknown"], ["high", "medium", "low", "unknown"]) %>
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			},
			{
				name: 'Census source',
				description: 'Template for census records',
				template: `---
type: source
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
source_type: census
source_date: <% tp.system.prompt("Census date (YYYY-MM-DD)?", "", false) %>
source_date_accessed: <% tp.date.now("YYYY-MM-DD") %>
source_repository: <% tp.system.suggester(["Ancestry.com", "FamilySearch", "FindMyPast", "MyHeritage", "National Archives", "Other"], ["Ancestry.com", "FamilySearch", "FindMyPast", "MyHeritage", "National Archives", ""]) %>
collection:
location:
confidence: high
source_quality: derivative
media:
---

# <% tp.file.title %>

## Census information

| Field | Value |
|-------|-------|
| Census year |  |
| State/country |  |
| County |  |
| Township/city |  |
| Enumeration district |  |
| Sheet/page |  |

## Household members

| Name | Relation | Age | Birthplace | Occupation |
|------|----------|-----|------------|------------|
|  |  |  |  |  |

## Transcription

<% tp.file.cursor() %>

## Research notes

`
			},
			{
				name: 'Vital record source',
				description: 'Template for birth, death, or marriage certificates',
				template: `---
type: source
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
source_type: vital_record
source_date: <% tp.system.prompt("Event date (YYYY-MM-DD)?", "", false) %>
source_repository:
location:
confidence: high
source_quality: primary
media:
---

# <% tp.file.title %>

## Document information

| Field | Value |
|-------|-------|
| Event type | <% tp.system.suggester(["Birth", "Death", "Marriage"], ["Birth", "Death", "Marriage"]) %> |
| Event date |  |
| Event place |  |
| Certificate number |  |

## People named

-

## Transcription

<% tp.file.cursor() %>`
			},
			{
				name: 'Full source note',
				description: 'Complete template with all source fields',
				template: `---
type: source
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
source_type: <% tp.system.suggester(["Census", "Vital record", "Church record", "Newspaper", "Photo", "Correspondence", "Military", "Court record", "Land deed", "Probate", "Immigration", "Obituary", "Oral history", "Custom"], ["census", "vital_record", "church_record", "newspaper", "photo", "correspondence", "military", "court_record", "land_deed", "probate", "immigration", "obituary", "oral_history", "custom"]) %>
source_date:
source_date_accessed: <% tp.date.now("YYYY-MM-DD") %>
source_repository:
source_repository_url:
collection:
location:
confidence: <% tp.system.suggester(["High", "Medium", "Low", "Unknown"], ["high", "medium", "low", "unknown"]) %>
source_quality: <% tp.system.suggester(["Primary (original record)", "Secondary (later account)", "Derivative (copy/transcription)"], ["primary", "secondary", "derivative"]) %>
media:
media_2:
citation_override:
---

# <% tp.file.title %>

## Source information

<% tp.file.cursor() %>

## Transcription

## Research notes

`
			}
		];
	}

	/**
	 * Get organization note templates
	 */
	private getOrganizationTemplates(): TemplateSnippet[] {
		return [
			{
				name: 'Basic organization note',
				description: 'Minimal template for any organization type',
				template: `---
type: organization
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
org_type: <% tp.system.suggester(["Noble house", "Guild", "Corporation", "Military", "Religious", "Political", "Educational", "Custom"], ["noble_house", "guild", "corporation", "military", "religious", "political", "educational", "custom"]) %>
---

# <% tp.file.title %>

<% tp.file.cursor() %>`
			},
			{
				name: 'Noble house',
				description: 'Template for feudal houses and dynasties',
				template: `---
type: organization
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
org_type: noble_house
parent_org:
founded:
dissolved:
motto:
seat:
universe: "<% tp.system.prompt("Universe/World name?", "", false) %>"
---

# <% tp.file.title %>

## History

<% tp.file.cursor() %>

## Notable members

## Heraldry

`
			},
			{
				name: 'Military unit',
				description: 'Template for armies, regiments, and military organizations',
				template: `---
type: organization
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
org_type: military
parent_org:
founded:
dissolved:
seat:
universe:
---

# <% tp.file.title %>

## Overview

<% tp.file.cursor() %>

## History

## Campaigns

## Notable members

`
			},
			{
				name: 'Full organization note',
				description: 'Complete template with all organization fields',
				template: `---
type: organization
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
name: "<% tp.file.title %>"
org_type: <% tp.system.suggester(["Noble house", "Guild", "Corporation", "Military", "Religious", "Political", "Educational", "Custom"], ["noble_house", "guild", "corporation", "military", "religious", "political", "educational", "custom"]) %>
parent_org:
founded: <% tp.system.prompt("Founded date?", "", false) %>
dissolved:
motto:
seat:
universe:
collection:
---

# <% tp.file.title %>

## Overview

<% tp.file.cursor() %>

## History

## Notable members

## See also

`
			}
		];
	}

	/**
	 * Get proof summary note templates
	 */
	private getProofTemplates(): TemplateSnippet[] {
		return [
			{
				name: 'Basic proof summary',
				description: 'Minimal template for documenting a genealogical conclusion',
				template: `---
type: proof_summary
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
subject_person:
fact_type: <% tp.system.suggester(["Birth date", "Birth place", "Death date", "Death place", "Parents", "Marriage date", "Marriage place", "Spouse", "Occupation", "Residence"], ["birth_date", "birth_place", "death_date", "death_place", "parents", "marriage_date", "marriage_place", "spouse", "occupation", "residence"]) %>
conclusion:
status: draft
confidence: possible
evidence: []
---

# <% tp.file.title %>

## Conclusion

<% tp.file.cursor() %>

## Evidence analysis

## Reasoning

`
			},
			{
				name: 'Proof summary with evidence',
				description: 'Template with pre-structured evidence entries',
				template: `---
type: proof_summary
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
subject_person: "[[<% tp.system.prompt("Subject person note name?", "", false) %>]]"
fact_type: <% tp.system.suggester(["Birth date", "Birth place", "Death date", "Death place", "Parents", "Marriage date", "Marriage place", "Spouse", "Occupation", "Residence"], ["birth_date", "birth_place", "death_date", "death_place", "parents", "marriage_date", "marriage_place", "spouse", "occupation", "residence"]) %>
conclusion: "<% tp.system.prompt("What is your conclusion?", "", false) %>"
status: <% tp.system.suggester(["Draft", "Complete", "Needs review", "Conflicted"], ["draft", "complete", "needs_review", "conflicted"]) %>
confidence: <% tp.system.suggester(["Proven", "Probable", "Possible", "Disproven"], ["proven", "probable", "possible", "disproven"]) %>
date_written: <% tp.date.now("YYYY-MM-DD") %>
evidence:
  - source:
    information:
    supports: <% tp.system.suggester(["Strongly supports", "Moderately supports", "Weakly supports", "Conflicts with"], ["strongly", "moderately", "weakly", "conflicts"]) %>
    notes:
---

# <% tp.file.title %>

## Conclusion

<% tp.file.cursor() %>

## Evidence analysis

### Source 1

**Information:**

**Assessment:**

### Source 2

**Information:**

**Assessment:**

## Reasoning

## Resolution (if conflicted)

`
			},
			{
				name: 'Conflict resolution proof',
				description: 'Template for documenting how conflicting evidence was resolved',
				template: `---
type: proof_summary
cr_id: <% tp.date.now("YYYYMMDDHHmmss") %>
title: "<% tp.file.title %>"
subject_person:
fact_type: <% tp.system.suggester(["Birth date", "Birth place", "Death date", "Death place", "Parents", "Marriage date", "Marriage place", "Spouse"], ["birth_date", "birth_place", "death_date", "death_place", "parents", "marriage_date", "marriage_place", "spouse"]) %>
conclusion:
status: conflicted
confidence: possible
date_written: <% tp.date.now("YYYY-MM-DD") %>
evidence:
  - source:
    information:
    supports: strongly
    notes:
  - source:
    information:
    supports: conflicts
    notes:
---

# <% tp.file.title %>

## The conflict

Describe the conflicting evidence here.

<% tp.file.cursor() %>

## Evidence analysis

### Supporting evidence

### Conflicting evidence

## Resolution

Explain how you resolved the conflict and why you chose one conclusion over another.

## Confidence assessment

`
			}
		];
	}
}
