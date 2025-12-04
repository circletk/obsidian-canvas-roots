/**
 * Create Organization Modal
 *
 * Modal for creating new organization notes with proper frontmatter.
 */

import { App, Modal, Setting, Notice } from 'obsidian';
import type CanvasRootsPlugin from '../../../main';
import type { OrganizationType } from '../types/organization-types';
import { DEFAULT_ORGANIZATION_TYPES } from '../constants/organization-types';
import { OrganizationService } from '../services/organization-service';

/**
 * Modal for creating a new organization note
 */
export class CreateOrganizationModal extends Modal {
	private plugin: CanvasRootsPlugin;
	private onSuccess: () => void;

	// Form fields
	private name: string = '';
	private orgType: OrganizationType = 'custom';
	private parentOrg: string = '';
	private universe: string = '';
	private founded: string = '';
	private motto: string = '';
	private seat: string = '';
	private folder: string;

	constructor(app: App, plugin: CanvasRootsPlugin, onSuccess: () => void) {
		super(app);
		this.plugin = plugin;
		this.onSuccess = onSuccess;
		this.folder = plugin.settings.organizationsFolder;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('cr-create-org-modal');

		contentEl.createEl('h2', { text: 'Create organization' });

		// Name
		new Setting(contentEl)
			.setName('Name')
			.setDesc('Display name for the organization')
			.addText(text => text
				.setPlaceholder('e.g., House Stark')
				.setValue(this.name)
				.onChange(value => this.name = value));

		// Organization type
		new Setting(contentEl)
			.setName('Type')
			.setDesc('Category of organization')
			.addDropdown(dropdown => {
				for (const typeDef of DEFAULT_ORGANIZATION_TYPES) {
					dropdown.addOption(typeDef.id, typeDef.name);
				}
				dropdown.setValue(this.orgType);
				dropdown.onChange(value => this.orgType = value as OrganizationType);
			});

		// Parent organization
		new Setting(contentEl)
			.setName('Parent organization')
			.setDesc('Optional parent in the hierarchy (wikilink)')
			.addText(text => text
				.setPlaceholder('[[Parent Org]]')
				.setValue(this.parentOrg)
				.onChange(value => this.parentOrg = value));

		// Universe
		new Setting(contentEl)
			.setName('Universe')
			.setDesc('Optional universe scope (e.g., westeros, middle-earth)')
			.addText(text => text
				.setPlaceholder('e.g., westeros')
				.setValue(this.universe)
				.onChange(value => this.universe = value));

		// Collapsible optional details
		const detailsEl = contentEl.createEl('details', { cls: 'cr-create-org-details' });
		detailsEl.createEl('summary', { text: 'Optional details' });

		// Founded
		new Setting(detailsEl)
			.setName('Founded')
			.setDesc('Founding date (supports fictional dates)')
			.addText(text => text
				.setPlaceholder('e.g., Age of Heroes, TA 2000')
				.setValue(this.founded)
				.onChange(value => this.founded = value));

		// Motto
		new Setting(detailsEl)
			.setName('Motto')
			.setDesc('Organization motto or slogan')
			.addText(text => text
				.setPlaceholder('e.g., Winter is Coming')
				.setValue(this.motto)
				.onChange(value => this.motto = value));

		// Seat
		new Setting(detailsEl)
			.setName('Seat')
			.setDesc('Primary location (wikilink to place note)')
			.addText(text => text
				.setPlaceholder('[[Winterfell]]')
				.setValue(this.seat)
				.onChange(value => this.seat = value));

		// Folder
		new Setting(detailsEl)
			.setName('Folder')
			.setDesc('Folder to create the note in')
			.addText(text => text
				.setPlaceholder('Canvas Roots/Organizations')
				.setValue(this.folder)
				.onChange(value => this.folder = value));

		// Buttons
		const buttonContainer = contentEl.createDiv({ cls: 'cr-modal-buttons' });

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const createBtn = buttonContainer.createEl('button', { text: 'Create', cls: 'mod-cta' });
		createBtn.addEventListener('click', () => this.createOrganization());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private async createOrganization(): Promise<void> {
		if (!this.name.trim()) {
			new Notice('Please enter an organization name');
			return;
		}

		try {
			const orgService = new OrganizationService(this.plugin);
			await orgService.createOrganization(this.name.trim(), this.orgType, {
				parentOrg: this.parentOrg.trim() || undefined,
				universe: this.universe.trim() || undefined,
				founded: this.founded.trim() || undefined,
				motto: this.motto.trim() || undefined,
				seat: this.seat.trim() || undefined,
				folder: this.folder.trim() || undefined
			});

			this.close();
			this.onSuccess();
		} catch (error) {
			new Notice(`Failed to create organization: ${error}`);
		}
	}
}
