/**
 * GEDCOM Importer for Canvas Roots
 *
 * Imports GEDCOM data into the Obsidian vault as person notes.
 */

import { App, Notice, TFile, normalizePath } from 'obsidian';
import { GedcomParser, GedcomData, GedcomIndividual } from './gedcom-parser';
import { createPersonNote, PersonData } from '../core/person-note-writer';
import { generateCrId } from '../core/uuid';

/**
 * GEDCOM import options
 */
export interface GedcomImportOptions {
	peopleFolder: string;
	overwriteExisting: boolean;
	fileName?: string;
}

/**
 * GEDCOM import result
 */
export interface GedcomImportResult {
	success: boolean;
	individualsProcessed: number;
	notesCreated: number;
	notesUpdated: number;
	notesSkipped: number;
	errors: string[];
	gedcomData?: GedcomData;
	fileName?: string;
}

/**
 * Import GEDCOM files into Canvas Roots
 */
export class GedcomImporter {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Import GEDCOM file
	 */
	async importFile(
		content: string,
		options: GedcomImportOptions
	): Promise<GedcomImportResult> {
		const result: GedcomImportResult = {
			success: false,
			individualsProcessed: 0,
			notesCreated: 0,
			notesUpdated: 0,
			notesSkipped: 0,
			errors: [],
			fileName: options.fileName
		};

		try {
			// Parse GEDCOM
			new Notice('Parsing GEDCOM file...');
			const gedcomData = GedcomParser.parse(content);
			result.gedcomData = gedcomData;

			new Notice(`Parsed ${gedcomData.individuals.size} individuals`);

			// Create person notes
			new Notice('Creating person notes...');

			// Ensure people folder exists
			await this.ensureFolderExists(options.peopleFolder);

			// Create mapping of GEDCOM IDs to cr_ids
			const gedcomToCrId = new Map<string, string>();

			// First pass: Create all person notes
			for (const [gedcomId, individual] of gedcomData.individuals) {
				try {
					const crId = await this.importIndividual(
						individual,
						gedcomData,
						options,
						gedcomToCrId
					);

					gedcomToCrId.set(gedcomId, crId);
					result.notesCreated++;
					result.individualsProcessed++;
				} catch (error) {
					result.errors.push(
						`Failed to import ${individual.name}: ${error.message}`
					);
				}
			}

			// Second pass: Update relationships now that all cr_ids are known
			for (const [gedcomId, individual] of gedcomData.individuals) {
				try {
					await this.updateRelationships(
						individual,
						gedcomData,
						gedcomToCrId,
						options
					);
				} catch (error) {
					result.errors.push(
						`Failed to update relationships for ${individual.name}: ${error.message}`
					);
				}
			}

			new Notice(
				`Import complete: ${result.notesCreated} notes created, ${result.errors.length} errors`
			);
			result.success = result.errors.length === 0;

		} catch (error) {
			result.errors.push(`GEDCOM parse error: ${error.message}`);
			new Notice(`Import failed: ${error.message}`);
		}

		return result;
	}

	/**
	 * Import a single individual
	 */
	private async importIndividual(
		individual: GedcomIndividual,
		gedcomData: GedcomData,
		options: GedcomImportOptions,
		gedcomToCrId: Map<string, string>
	): Promise<string> {
		const crId = generateCrId();

		// Convert GEDCOM individual to PersonData
		const personData: PersonData = {
			name: individual.name || 'Unknown',
			crId: crId,
			birthDate: GedcomParser.gedcomDateToISO(individual.birthDate || ''),
			deathDate: GedcomParser.gedcomDateToISO(individual.deathDate || '')
		};

		// Add relationship references with both GEDCOM IDs (temporary) and names
		if (individual.fatherRef) {
			personData.fatherCrId = individual.fatherRef; // Temporary GEDCOM ID
			const father = gedcomData.individuals.get(individual.fatherRef);
			if (father) {
				personData.fatherName = father.name || 'Unknown';
			}
		}
		if (individual.motherRef) {
			personData.motherCrId = individual.motherRef; // Temporary GEDCOM ID
			const mother = gedcomData.individuals.get(individual.motherRef);
			if (mother) {
				personData.motherName = mother.name || 'Unknown';
			}
		}
		if (individual.spouseRefs.length > 0) {
			personData.spouseCrId = individual.spouseRefs; // Temporary GEDCOM IDs
			personData.spouseName = individual.spouseRefs.map(ref => {
				const spouse = gedcomData.individuals.get(ref);
				return spouse?.name || 'Unknown';
			});
		}

		// Write person note using the createPersonNote function
		// Disable bidirectional linking during import - we'll fix relationships in pass 2
		await createPersonNote(this.app, personData, {
			directory: options.peopleFolder,
			addBidirectionalLinks: false
		});

		return crId;
	}

	/**
	 * Update relationships with actual cr_ids
	 */
	private async updateRelationships(
		individual: GedcomIndividual,
		gedcomData: GedcomData,
		gedcomToCrId: Map<string, string>,
		options: GedcomImportOptions
	): Promise<void> {
		const crId = gedcomToCrId.get(individual.id);
		if (!crId) return;

		// Generate the expected file name
		const fileName = this.generateFileName(individual.name || 'Unknown');
		const filePath = options.peopleFolder
			? `${options.peopleFolder}/${fileName}`
			: fileName;

		const normalizedPath = normalizePath(filePath);
		const file = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (!file || !(file instanceof TFile)) {
			return;
		}

		// Read the file
		const content = await this.app.vault.read(file);

		// Update frontmatter with real cr_ids (replacing temporary GEDCOM IDs)
		let updatedContent = content;

		// Replace father_id reference with real cr_id
		if (individual.fatherRef) {
			const fatherCrId = gedcomToCrId.get(individual.fatherRef);
			if (fatherCrId) {
				// Escape special regex characters in GEDCOM ID
				const escapedRef = individual.fatherRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				updatedContent = updatedContent.replace(
					new RegExp(`father_id: ${escapedRef}`, 'g'),
					`father_id: ${fatherCrId}`
				);
			}
		}

		// Replace mother_id reference with real cr_id
		if (individual.motherRef) {
			const motherCrId = gedcomToCrId.get(individual.motherRef);
			if (motherCrId) {
				// Escape special regex characters in GEDCOM ID
				const escapedRef = individual.motherRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				updatedContent = updatedContent.replace(
					new RegExp(`mother_id: ${escapedRef}`, 'g'),
					`mother_id: ${motherCrId}`
				);
			}
		}

		// Replace spouse_id references with real cr_ids
		if (individual.spouseRefs.length > 0) {
			// Replace each GEDCOM ID with its corresponding cr_id in the spouse_id field
			for (const spouseRef of individual.spouseRefs) {
				const spouseCrId = gedcomToCrId.get(spouseRef);
				if (spouseCrId) {
					// Escape special regex characters in GEDCOM ID
					const escapedRef = spouseRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					updatedContent = updatedContent.replace(
						new RegExp(`spouse_id: ${escapedRef}`, 'g'),
						`spouse_id: ${spouseCrId}`
					);
					// Also replace in array format
					updatedContent = updatedContent.replace(
						new RegExp(`  - ${escapedRef}`, 'g'),
						`  - ${spouseCrId}`
					);
				}
			}
		}

		// Write updated content if changed
		if (updatedContent !== content) {
			await this.app.vault.modify(file, updatedContent);
		}
	}

	/**
	 * Generate file name from person name
	 */
	private generateFileName(name: string): string {
		// Sanitize name for file system
		const sanitized = name
			.replace(/[\\/:*?"<>|]/g, '-')
			.replace(/\s+/g, ' ')
			.trim();

		return `${sanitized}.md`;
	}

	/**
	 * Ensure folder exists, create if necessary
	 */
	private async ensureFolderExists(folderPath: string): Promise<void> {
		if (!folderPath) return;

		const normalizedPath = normalizePath(folderPath);
		const folder = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (!folder) {
			await this.app.vault.createFolder(normalizedPath);
		}
	}
}
