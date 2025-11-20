import { Plugin, Notice, TFile } from 'obsidian';
import { CanvasRootsSettings, DEFAULT_SETTINGS, CanvasRootsSettingTab } from './src/settings';
import { ControlCenterModal } from './src/ui/control-center';

export default class CanvasRootsPlugin extends Plugin {
	settings: CanvasRootsSettings;

	async onload() {
		console.log('Loading Canvas Roots plugin');

		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new CanvasRootsSettingTab(this.app, this));

		// Add ribbon icon for Control Center
		this.addRibbonIcon('users', 'Open Canvas Roots Control Center', () => {
			new ControlCenterModal(this.app, this).open();
		});

		// Add command: Open Control Center
		this.addCommand({
			id: 'open-control-center',
			name: 'Open Control Center',
			callback: () => {
				new ControlCenterModal(this.app, this).open();
			}
		});

		// Add command: Generate Tree for Current Note
		this.addCommand({
			id: 'generate-tree-for-current-note',
			name: 'Generate Tree for Current Note',
			callback: () => {
				this.generateTreeForCurrentNote();
			}
		});

		// Add command: Re-Layout Current Canvas
		this.addCommand({
			id: 'relayout-current-canvas',
			name: 'Re-Layout Current Canvas',
			callback: () => {
				this.relayoutCurrentCanvas();
			}
		});

		// Add context menu item for person notes
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				// Only show for markdown files with cr_id in frontmatter
				if (file instanceof TFile && file.extension === 'md') {
					const cache = this.app.metadataCache.getFileCache(file);
					if (cache?.frontmatter?.cr_id) {
						menu.addItem((item) => {
							item
								.setTitle('Generate Family Tree')
								.setIcon('git-fork')
								.onClick(async () => {
									// Open Control Center with this person pre-selected
									const modal = new ControlCenterModal(this.app, this);
									await modal.openWithPerson(file);
								});
						});
					}
				}
			})
		);
	}

	async onunload() {
		console.log('Unloading Canvas Roots plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async generateTreeForCurrentNote() {
		const activeFile = this.app.workspace.getActiveFile();

		if (!activeFile) {
			new Notice('No active note. Please open a person note first.');
			return;
		}

		new Notice(`Generating tree for: ${activeFile.basename}`);

		// TODO: Implement tree generation logic
		// 1. Extract person data from current note
		// 2. Traverse relationships to build family graph
		// 3. Calculate D3 layout
		// 4. Generate Canvas nodes and edges
		// 5. Write to Canvas file
	}

	private async relayoutCurrentCanvas() {
		const activeFile = this.app.workspace.getActiveFile();

		if (!activeFile || activeFile.extension !== 'canvas') {
			new Notice('No active canvas. Please open a canvas file first.');
			return;
		}

		new Notice('Re-layouting canvas...');

		// TODO: Implement relayout logic
		// 1. Read current Canvas JSON
		// 2. Extract existing nodes and their linked files
		// 3. Recalculate D3 layout
		// 4. Update node positions in Canvas JSON
		// 5. Write back to Canvas file
	}
}
