/**
 * Organization Notes Module
 *
 * Provides support for tracking non-genealogical hierarchies such as
 * noble houses, guilds, corporations, military units, and religious orders.
 */

// Types
export type {
	OrganizationType,
	OrganizationTypeDefinition,
	OrganizationInfo,
	OrganizationFrontmatter,
	MembershipData,
	PersonMembership,
	OrganizationWithMembers,
	OrganizationHierarchyNode,
	OrganizationStats
} from './types/organization-types';

// Constants
export {
	NOBLE_HOUSE,
	GUILD,
	CORPORATION,
	MILITARY,
	RELIGIOUS,
	POLITICAL,
	EDUCATIONAL,
	CUSTOM,
	DEFAULT_ORGANIZATION_TYPES,
	getOrganizationType,
	getAllOrganizationTypes,
	isValidOrganizationType
} from './constants/organization-types';

// Services
export {
	OrganizationService,
	createOrganizationService
} from './services/organization-service';

export {
	MembershipService,
	createMembershipService
} from './services/membership-service';

// UI Components
export { renderOrganizationsTab } from './ui/organizations-tab';
export { CreateOrganizationModal } from './ui/create-organization-modal';
export { AddMembershipModal } from './ui/add-membership-modal';
