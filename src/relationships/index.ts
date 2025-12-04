/**
 * Relationships module for Canvas Roots
 *
 * Provides custom relationship type management, parsing, and visualization.
 */

// Types
export type {
	RelationshipCategory,
	RelationshipLineStyle,
	RelationshipTypeDefinition,
	RawRelationship,
	ParsedRelationship,
	RelationshipStats,
	RelationshipValidationResult
} from './types/relationship-types';

export {
	RELATIONSHIP_CATEGORY_NAMES,
	extractWikilinkName,
	extractWikilinkPath,
	isWikilink
} from './types/relationship-types';

// Constants
export {
	DEFAULT_RELATIONSHIP_TYPES,
	getDefaultRelationshipType,
	getDefaultRelationshipTypesByCategory
} from './constants/default-relationship-types';

// Services
export { RelationshipService } from './services/relationship-service';
