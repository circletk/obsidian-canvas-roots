/**
 * Organizations Tab UI Component
 *
 * Renders the Organizations tab in the Control Center, showing
 * organizations list, statistics, and hierarchy.
 */

import { setIcon, Notice, ToggleComponent, Setting } from 'obsidian';
import type CanvasRootsPlugin from '../../../main';
import type { LucideIconName } from '../../ui/lucide-icons';
import { OrganizationService } from '../services/organization-service';
import { MembershipService } from '../services/membership-service';
import type {
	OrganizationInfo,
	OrganizationType,
	OrganizationHierarchyNode
} from '../types/organization-types';
import { getOrganizationType, DEFAULT_ORGANIZATION_TYPES } from '../constants/organization-types';
import { CreateOrganizationModal } from './create-organization-modal';

/**
 * Render the Organizations tab content
 */
export async function renderOrganizationsTab(
	container: HTMLElement,
	plugin: CanvasRootsPlugin,
	createCard: (options: { title: string; icon?: LucideIconName }) => HTMLElement,
	showTab: (tabId: string) => void
): Promise<void> {
	const orgService = new OrganizationService(plugin);
	const membershipService = new MembershipService(plugin, orgService);

	// Organizations List card
	renderOrganizationsListCard(container, plugin, orgService, membershipService, createCard, showTab);

	// Statistics card
	renderOrganizationStatsCard(container, orgService, membershipService, createCard);

	// Organization Types card
	renderOrganizationTypesCard(container, plugin, createCard, showTab);

	// Data tools card
	renderDataToolsCard(container, plugin, createCard);
}

/**
 * Render the main Organizations List card
 */
function renderOrganizationsListCard(
	container: HTMLElement,
	plugin: CanvasRootsPlugin,
	orgService: OrganizationService,
	membershipService: MembershipService,
	createCard: (options: { title: string; icon?: LucideIconName }) => HTMLElement,
	showTab: (tabId: string) => void
): void {
	const card = createCard({
		title: 'Organizations',
		icon: 'building'
	});
	const content = card.querySelector('.crc-card__content') as HTMLElement;

	// Toolbar
	const toolbar = content.createDiv({ cls: 'crc-card-toolbar' });

	const addBtn = toolbar.createEl('button', { cls: 'mod-cta' });
	setIcon(addBtn.createSpan({ cls: 'crc-button-icon' }), 'plus');
	addBtn.createSpan({ text: 'Create organization' });
	addBtn.addEventListener('click', () => {
		new CreateOrganizationModal(plugin.app, plugin, async () => {
			showTab('organizations');
		}).open();
	});

	// Get organizations grouped by type
	const orgs = orgService.getAllOrganizations();

	if (orgs.length === 0) {
		const emptyState = content.createDiv({ cls: 'crc-empty-state' });
		setIcon(emptyState.createSpan({ cls: 'crc-empty-icon' }), 'building');
		emptyState.createEl('p', { text: 'No organizations found.' });
		emptyState.createEl('p', {
			cls: 'crc-text-muted',
			text: 'Create organization notes with type: organization in frontmatter, or use the button above.'
		});
	} else {
		// Group by type
		const byType = new Map<OrganizationType, OrganizationInfo[]>();
		for (const org of orgs) {
			const list = byType.get(org.orgType) || [];
			list.push(org);
			byType.set(org.orgType, list);
		}

		// Render each group
		for (const [orgType, typeOrgs] of byType) {
			const typeDef = getOrganizationType(orgType);
			const section = content.createDiv({ cls: 'cr-org-section' });

			// Section header
			const header = section.createDiv({ cls: 'cr-org-section-header' });
			const headerIcon = header.createSpan({ cls: 'cr-org-section-icon' });
			setIcon(headerIcon, typeDef.icon);
			headerIcon.style.color = typeDef.color;
			header.createSpan({ text: typeDef.name.toUpperCase(), cls: 'cr-org-section-title' });
			header.createSpan({ text: `(${typeOrgs.length})`, cls: 'crc-text-muted' });

			// Organization list
			const list = section.createDiv({ cls: 'cr-org-list' });
			for (const org of typeOrgs.sort((a, b) => a.name.localeCompare(b.name))) {
				renderOrganizationItem(list, org, orgService, membershipService, plugin);
			}
		}
	}

	container.appendChild(card);
}

/**
 * Render a single organization item
 */
function renderOrganizationItem(
	container: HTMLElement,
	org: OrganizationInfo,
	orgService: OrganizationService,
	membershipService: MembershipService,
	plugin: CanvasRootsPlugin
): void {
	const typeDef = getOrganizationType(org.orgType);
	const members = membershipService.getOrganizationMembers(org.crId);
	const children = orgService.getChildOrganizations(org.crId);

	const item = container.createDiv({ cls: 'cr-org-item' });

	// Color indicator
	const colorBar = item.createDiv({ cls: 'cr-org-item-color' });
	colorBar.style.backgroundColor = typeDef.color;

	// Main content
	const main = item.createDiv({ cls: 'cr-org-item-main' });

	// Name row
	const nameRow = main.createDiv({ cls: 'cr-org-item-name-row' });
	const nameLink = nameRow.createEl('a', { text: org.name, cls: 'cr-org-item-name' });
	nameLink.addEventListener('click', (e) => {
		e.preventDefault();
		plugin.app.workspace.openLinkText(org.file.path, '');
	});

	if (org.motto) {
		nameRow.createSpan({ text: `"${org.motto}"`, cls: 'cr-org-item-motto' });
	}

	// Info row
	const infoRow = main.createDiv({ cls: 'cr-org-item-info' });

	if (members.length > 0) {
		infoRow.createSpan({ text: `${members.length} member${members.length !== 1 ? 's' : ''}` });
	}

	if (children.length > 0) {
		infoRow.createSpan({ text: `${children.length} sub-org${children.length !== 1 ? 's' : ''}` });
	}

	if (org.universe) {
		infoRow.createSpan({ text: org.universe, cls: 'cr-org-item-universe' });
	}

	if (org.founded) {
		infoRow.createSpan({ text: `Founded: ${org.founded}`, cls: 'crc-text-muted' });
	}

	// Actions
	const actions = item.createDiv({ cls: 'cr-org-item-actions' });
	const viewBtn = actions.createEl('button', {
		cls: 'cr-btn-icon',
		attr: { 'aria-label': 'Open note' }
	});
	setIcon(viewBtn, 'external-link');
	viewBtn.addEventListener('click', () => {
		plugin.app.workspace.openLinkText(org.file.path, '');
	});
}

/**
 * Render the Organization Statistics card
 */
function renderOrganizationStatsCard(
	container: HTMLElement,
	orgService: OrganizationService,
	membershipService: MembershipService,
	createCard: (options: { title: string; icon?: LucideIconName }) => HTMLElement
): void {
	const card = createCard({
		title: 'Statistics',
		icon: 'bar-chart'
	});
	const content = card.querySelector('.crc-card__content') as HTMLElement;

	const stats = orgService.getStats();
	const membershipStats = membershipService.getMembershipStats();

	// Summary stats
	const statsGrid = content.createDiv({ cls: 'cr-stats-grid' });

	const createStatItem = (label: string, value: string | number) => {
		const item = statsGrid.createDiv({ cls: 'cr-stat-item' });
		item.createDiv({ cls: 'cr-stat-value', text: String(value) });
		item.createDiv({ cls: 'cr-stat-label', text: label });
	};

	createStatItem('Organizations', stats.total);
	createStatItem('People with memberships', membershipStats.peopleWithMemberships);
	createStatItem('Total memberships', membershipStats.totalMemberships);

	// Breakdown by type
	if (stats.total > 0) {
		const breakdown = content.createDiv({ cls: 'cr-stats-breakdown' });
		breakdown.createEl('h4', { text: 'By type', cls: 'cr-subsection-heading' });

		const typeList = breakdown.createDiv({ cls: 'cr-type-breakdown-list' });
		for (const typeDef of DEFAULT_ORGANIZATION_TYPES) {
			const count = stats.byType[typeDef.id] || 0;
			if (count === 0) continue;

			const row = typeList.createDiv({ cls: 'cr-type-breakdown-row' });
			const swatch = row.createDiv({ cls: 'cr-type-swatch' });
			swatch.style.backgroundColor = typeDef.color;
			row.createSpan({ text: typeDef.name });
			row.createSpan({ text: String(count), cls: 'crc-text-muted' });
		}
	}

	container.appendChild(card);
}

/**
 * Render the Organization Types card
 */
function renderOrganizationTypesCard(
	container: HTMLElement,
	plugin: CanvasRootsPlugin,
	createCard: (options: { title: string; icon?: LucideIconName }) => HTMLElement,
	showTab: (tabId: string) => void
): void {
	const card = createCard({
		title: 'Organization types',
		icon: 'layers'
	});
	const content = card.querySelector('.crc-card__content') as HTMLElement;

	// Toggle for built-in types
	const toolbar = content.createDiv({ cls: 'crc-card-toolbar' });
	const toggleContainer = toolbar.createDiv({ cls: 'crc-toggle-inline' });
	const toggleLabel = toggleContainer.createEl('label', { text: 'Show built-in types' });
	const toggle = new ToggleComponent(toggleContainer);
	toggle.setValue(plugin.settings.showBuiltInOrganizationTypes);
	toggle.onChange(async (value) => {
		plugin.settings.showBuiltInOrganizationTypes = value;
		await plugin.saveSettings();
		showTab('organizations');
	});
	toggleLabel.htmlFor = toggle.toggleEl.id;

	// Types table
	const types = plugin.settings.showBuiltInOrganizationTypes
		? DEFAULT_ORGANIZATION_TYPES
		: plugin.settings.customOrganizationTypes;

	if (types.length === 0) {
		content.createEl('p', {
			cls: 'crc-text-muted',
			text: 'No custom organization types defined. Toggle "Show built-in types" to see default types.'
		});
	} else {
		const table = content.createEl('table', { cls: 'cr-org-types-table' });

		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		headerRow.createEl('th', { text: 'Type' });
		headerRow.createEl('th', { text: 'Icon' });
		headerRow.createEl('th', { text: 'Source' });

		const tbody = table.createEl('tbody');
		for (const typeDef of types) {
			const row = tbody.createEl('tr');

			// Name with color swatch
			const nameCell = row.createEl('td');
			const nameWrapper = nameCell.createDiv({ cls: 'cr-type-name-wrapper' });
			const swatch = nameWrapper.createDiv({ cls: 'cr-type-swatch' });
			swatch.style.backgroundColor = typeDef.color;
			nameWrapper.createSpan({ text: typeDef.name });

			// Icon
			const iconCell = row.createEl('td');
			const iconSpan = iconCell.createSpan({ cls: 'cr-type-icon' });
			setIcon(iconSpan, typeDef.icon);

			// Source
			const sourceCell = row.createEl('td');
			if (typeDef.builtIn) {
				sourceCell.createSpan({ text: 'built-in', cls: 'crc-badge crc-badge--muted' });
			} else {
				sourceCell.createSpan({ text: 'custom', cls: 'crc-badge' });
			}
		}
	}

	container.appendChild(card);
}

/**
 * Render the Data Tools card
 */
function renderDataToolsCard(
	container: HTMLElement,
	plugin: CanvasRootsPlugin,
	createCard: (options: { title: string; icon?: LucideIconName }) => HTMLElement
): void {
	const card = createCard({
		title: 'Data tools',
		icon: 'table-2'
	});
	const content = card.querySelector('.crc-card__content') as HTMLElement;

	new Setting(content)
		.setName('Create base template')
		.setDesc('Create a ready-to-use Obsidian Bases template for managing organizations in table view')
		.addButton(btn => btn
			.setButtonText('Create template')
			.setCta()
			.onClick(() => {
				plugin.app.commands.executeCommandById('canvas-roots:create-organizations-base-template');
			})
		);

	container.appendChild(card);
}
