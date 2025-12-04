/**
 * Default built-in relationship types for Canvas Roots
 *
 * These types cover common real-world genealogical relationships
 * as well as world-building scenarios for fiction writers.
 */

import type { RelationshipTypeDefinition } from '../types/relationship-types';

/**
 * Built-in relationship types
 *
 * Color palette uses Tailwind CSS colors for consistency:
 * - Teal (#14b8a6) - Legal/Guardianship
 * - Cyan (#06b6d4) - Adoption
 * - Sky (#0ea5e9) - Foster
 * - Blue (#3b82f6) - Religious (godparent)
 * - Violet (#8b5cf6) - Religious (mentor)
 * - Orange (#f97316) - Professional
 * - Gray (#6b7280, #9ca3af) - Social (witness, neighbor)
 * - Green (#22c55e) - Social (companion)
 * - Pink (#ec4899) - Social (betrothed)
 * - Yellow/Gold (#eab308) - Feudal
 * - Emerald (#10b981) - Ally
 * - Red (#ef4444) - Rival
 */
export const DEFAULT_RELATIONSHIP_TYPES: RelationshipTypeDefinition[] = [
	// Legal/Guardianship
	{
		id: 'guardian',
		name: 'Guardian',
		category: 'legal',
		color: '#14b8a6',
		lineStyle: 'solid',
		inverse: 'ward',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'ward',
		name: 'Ward',
		category: 'legal',
		color: '#14b8a6',
		lineStyle: 'solid',
		inverse: 'guardian',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'adoptive_parent',
		name: 'Adoptive parent',
		category: 'legal',
		color: '#06b6d4',
		lineStyle: 'solid',
		inverse: 'adopted_child',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'adopted_child',
		name: 'Adopted child',
		category: 'legal',
		color: '#06b6d4',
		lineStyle: 'solid',
		inverse: 'adoptive_parent',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'foster_parent',
		name: 'Foster parent',
		category: 'legal',
		color: '#0ea5e9',
		lineStyle: 'solid',
		inverse: 'foster_child',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'foster_child',
		name: 'Foster child',
		category: 'legal',
		color: '#0ea5e9',
		lineStyle: 'solid',
		inverse: 'foster_parent',
		symmetric: false,
		builtIn: true
	},

	// Religious/Spiritual
	{
		id: 'godparent',
		name: 'Godparent',
		category: 'religious',
		color: '#3b82f6',
		lineStyle: 'solid',
		inverse: 'godchild',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'godchild',
		name: 'Godchild',
		category: 'religious',
		color: '#3b82f6',
		lineStyle: 'solid',
		inverse: 'godparent',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'mentor',
		name: 'Mentor',
		category: 'religious',
		color: '#8b5cf6',
		lineStyle: 'solid',
		inverse: 'disciple',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'disciple',
		name: 'Disciple',
		category: 'religious',
		color: '#8b5cf6',
		lineStyle: 'solid',
		inverse: 'mentor',
		symmetric: false,
		builtIn: true
	},

	// Professional
	{
		id: 'master',
		name: 'Master',
		category: 'professional',
		color: '#f97316',
		lineStyle: 'solid',
		inverse: 'apprentice',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'apprentice',
		name: 'Apprentice',
		category: 'professional',
		color: '#f97316',
		lineStyle: 'solid',
		inverse: 'master',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'employer',
		name: 'Employer',
		category: 'professional',
		color: '#ea580c',
		lineStyle: 'solid',
		inverse: 'employee',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'employee',
		name: 'Employee',
		category: 'professional',
		color: '#ea580c',
		lineStyle: 'solid',
		inverse: 'employer',
		symmetric: false,
		builtIn: true
	},

	// Social
	{
		id: 'witness',
		name: 'Witness',
		category: 'social',
		color: '#6b7280',
		lineStyle: 'dashed',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'neighbor',
		name: 'Neighbor',
		category: 'social',
		color: '#9ca3af',
		lineStyle: 'dashed',
		symmetric: true,
		builtIn: true
	},
	{
		id: 'companion',
		name: 'Companion',
		category: 'social',
		color: '#22c55e',
		lineStyle: 'solid',
		symmetric: true,
		builtIn: true
	},
	{
		id: 'betrothed',
		name: 'Betrothed',
		category: 'social',
		color: '#ec4899',
		lineStyle: 'dashed',
		symmetric: true,
		builtIn: true
	},

	// Feudal/World-building
	{
		id: 'liege',
		name: 'Liege lord',
		category: 'feudal',
		color: '#eab308',
		lineStyle: 'solid',
		inverse: 'vassal',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'vassal',
		name: 'Vassal',
		category: 'feudal',
		color: '#eab308',
		lineStyle: 'solid',
		inverse: 'liege',
		symmetric: false,
		builtIn: true
	},
	{
		id: 'ally',
		name: 'Ally',
		category: 'feudal',
		color: '#10b981',
		lineStyle: 'dashed',
		symmetric: true,
		builtIn: true
	},
	{
		id: 'rival',
		name: 'Rival',
		category: 'feudal',
		color: '#ef4444',
		lineStyle: 'dashed',
		symmetric: true,
		builtIn: true
	}
];

/**
 * Get a default relationship type by ID
 */
export function getDefaultRelationshipType(id: string): RelationshipTypeDefinition | undefined {
	return DEFAULT_RELATIONSHIP_TYPES.find(t => t.id === id);
}

/**
 * Get all default relationship types for a category
 */
export function getDefaultRelationshipTypesByCategory(category: string): RelationshipTypeDefinition[] {
	return DEFAULT_RELATIONSHIP_TYPES.filter(t => t.category === category);
}
