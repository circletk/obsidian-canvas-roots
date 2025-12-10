/**
 * Property Alias Service
 *
 * Allows users to map custom frontmatter property names to Canvas Roots
 * canonical names. This enables compatibility with existing vaults that
 * use different naming conventions (e.g., "birthdate" instead of "born").
 */

import type CanvasRootsPlugin from '../../main';

/**
 * Canonical person note properties that can be aliased
 */
export const CANONICAL_PERSON_PROPERTIES = [
	// Core identity
	'name',
	'cr_id',
	'type',
	'sex',
	'gender', // Kept for users who prefer gender over sex
	'nickname',
	'maiden_name',
	// Dates
	'born',
	'died',
	// Places
	'birth_place',
	'death_place',
	// Relationships
	'father',
	'father_id',
	'mother',
	'mother_id',
	'parents',       // Array of parent links (alternative to father/mother)
	'parents_id',    // Array of parent cr_ids
	'spouse',
	'spouse_id',
	'partners',      // Array of partner/spouse links (alternative to spouse)
	'partners_id',   // Array of partner cr_ids
	'child',
	'children_id',
	// Other
	'occupation',
	'universe',
	'image',
	'sourced_facts',
	'relationships'
] as const;

export type CanonicalPersonProperty = typeof CANONICAL_PERSON_PROPERTIES[number];

/**
 * Canonical event note properties that can be aliased
 */
export const CANONICAL_EVENT_PROPERTIES = [
	// Core
	'cr_id',
	'cr_type',
	'title',
	'event_type',
	// Dates
	'date',
	'date_end',
	'date_precision',
	'date_system',
	// People
	'person',      // Primary person involved
	'persons',     // Multiple people involved (alias: participants)
	// Location
	'place',
	// Sources and confidence
	'sources',
	'confidence',
	// Description and metadata
	'description',
	'is_canonical',
	'universe',
	// Ordering
	'before',
	'after',
	'timeline',
	// Groups/factions
	'groups'
] as const;

export type CanonicalEventProperty = typeof CANONICAL_EVENT_PROPERTIES[number];

/**
 * Canonical place note properties that can be aliased
 */
export const CANONICAL_PLACE_PROPERTIES = [
	'cr_id',
	'cr_type',
	'name',
	'place_type',
	'parent_place',
	'coordinates',
	'universe',
	'collection'
] as const;

export type CanonicalPlaceProperty = typeof CANONICAL_PLACE_PROPERTIES[number];

/**
 * All canonical properties across all note types
 */
export const ALL_CANONICAL_PROPERTIES = [
	...CANONICAL_PERSON_PROPERTIES,
	...CANONICAL_EVENT_PROPERTIES,
	...CANONICAL_PLACE_PROPERTIES
] as const;

/**
 * Human-readable labels for canonical properties (for UI display)
 */
export const CANONICAL_PROPERTY_LABELS: Record<string, string> = {
	// Person properties
	name: 'Name',
	cr_id: 'CR ID',
	type: 'Type',
	sex: 'Sex',
	gender: 'Gender',
	nickname: 'Nickname',
	maiden_name: 'Maiden name',
	born: 'Birth date',
	died: 'Death date',
	birth_place: 'Birth place',
	death_place: 'Death place',
	father: 'Father',
	father_id: 'Father ID',
	mother: 'Mother',
	mother_id: 'Mother ID',
	parents: 'Parents (array)',
	parents_id: 'Parents ID (array)',
	spouse: 'Spouse',
	spouse_id: 'Spouse ID',
	partners: 'Partners (array)',
	partners_id: 'Partners ID (array)',
	child: 'Child/Children',
	children_id: 'Children ID',
	occupation: 'Occupation',
	universe: 'Universe',
	image: 'Image',
	sourced_facts: 'Sourced facts',
	relationships: 'Relationships',
	// Event properties
	cr_type: 'CR type',
	title: 'Title',
	event_type: 'Event type',
	date: 'Date',
	date_end: 'End date',
	date_precision: 'Date precision',
	date_system: 'Date system',
	person: 'Person',
	persons: 'Persons/Participants',
	place: 'Place',
	sources: 'Sources',
	confidence: 'Confidence',
	description: 'Description',
	is_canonical: 'Is canonical',
	before: 'Before',
	after: 'After',
	timeline: 'Timeline',
	groups: 'Groups',
	// Place properties
	place_type: 'Place type',
	parent_place: 'Parent place',
	coordinates: 'Coordinates',
	collection: 'Collection'
};

/**
 * Service for resolving property aliases
 */
export class PropertyAliasService {
	private plugin: CanvasRootsPlugin;

	constructor(plugin: CanvasRootsPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Get the configured aliases
	 */
	get aliases(): Record<string, string> {
		return this.plugin.settings.propertyAliases;
	}

	/**
	 * Resolve a property value from frontmatter using alias mapping.
	 * Checks canonical property first, then falls back to aliases.
	 *
	 * @param frontmatter - The note's frontmatter object
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 * @returns The property value, or undefined if not found
	 */
	resolve(frontmatter: Record<string, unknown>, canonicalProperty: string): unknown {
		// Canonical property takes precedence
		if (frontmatter[canonicalProperty] !== undefined) {
			return frontmatter[canonicalProperty];
		}

		// Check aliases - find user property that maps to this canonical property
		for (const [userProp, mappedCanonical] of Object.entries(this.aliases)) {
			if (mappedCanonical === canonicalProperty && frontmatter[userProp] !== undefined) {
				return frontmatter[userProp];
			}
		}

		return undefined;
	}

	/**
	 * Get the property name to use when writing to frontmatter.
	 * Returns the aliased name if configured, otherwise the canonical name.
	 *
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 * @returns The property name to write to
	 */
	getWriteProperty(canonicalProperty: string): string {
		// Find if user has an alias for this canonical property
		for (const [userProp, mappedCanonical] of Object.entries(this.aliases)) {
			if (mappedCanonical === canonicalProperty) {
				return userProp;
			}
		}
		return canonicalProperty;
	}

	/**
	 * Get the property name to display in UI.
	 * Returns the aliased name if configured, otherwise the canonical name.
	 * Same as getWriteProperty - users should see their preferred names.
	 *
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 * @returns The property name to display
	 */
	getDisplayProperty(canonicalProperty: string): string {
		return this.getWriteProperty(canonicalProperty);
	}

	/**
	 * Check if a property has an alias configured
	 *
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 * @returns True if an alias is configured for this property
	 */
	hasAlias(canonicalProperty: string): boolean {
		return Object.values(this.aliases).includes(canonicalProperty);
	}

	/**
	 * Get the alias for a canonical property, if configured
	 *
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 * @returns The alias, or undefined if not configured
	 */
	getAlias(canonicalProperty: string): string | undefined {
		for (const [userProp, mappedCanonical] of Object.entries(this.aliases)) {
			if (mappedCanonical === canonicalProperty) {
				return userProp;
			}
		}
		return undefined;
	}

	/**
	 * Add or update an alias
	 *
	 * @param userProperty - The user's property name
	 * @param canonicalProperty - The Canvas Roots canonical property name
	 */
	async setAlias(userProperty: string, canonicalProperty: string): Promise<void> {
		// Remove any existing alias for this canonical property
		for (const [existingUser, existingCanonical] of Object.entries(this.aliases)) {
			if (existingCanonical === canonicalProperty) {
				delete this.plugin.settings.propertyAliases[existingUser];
			}
		}

		// Set the new alias
		this.plugin.settings.propertyAliases[userProperty] = canonicalProperty;
		await this.plugin.saveSettings();
	}

	/**
	 * Remove an alias
	 *
	 * @param userProperty - The user's property name to remove
	 */
	async removeAlias(userProperty: string): Promise<void> {
		delete this.plugin.settings.propertyAliases[userProperty];
		await this.plugin.saveSettings();
	}

	/**
	 * Get all configured aliases as an array for display
	 *
	 * @returns Array of { userProperty, canonicalProperty } objects
	 */
	getAllAliases(): Array<{ userProperty: string; canonicalProperty: string }> {
		return Object.entries(this.aliases).map(([userProperty, canonicalProperty]) => ({
			userProperty,
			canonicalProperty
		}));
	}

	/**
	 * Resolve multiple properties at once from frontmatter.
	 * Convenience method for resolving all person properties.
	 *
	 * @param frontmatter - The note's frontmatter object
	 * @param properties - Array of canonical property names to resolve
	 * @returns Object with resolved values
	 */
	resolveAll(
		frontmatter: Record<string, unknown>,
		properties: string[]
	): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		for (const prop of properties) {
			const value = this.resolve(frontmatter, prop);
			if (value !== undefined) {
				result[prop] = value;
			}
		}
		return result;
	}
}

/**
 * Create a PropertyAliasService instance
 */
export function createPropertyAliasService(plugin: CanvasRootsPlugin): PropertyAliasService {
	return new PropertyAliasService(plugin);
}
