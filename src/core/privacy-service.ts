/**
 * Privacy Service for Canvas Roots
 *
 * Provides privacy protection for living persons in genealogical data.
 * Determines if a person is likely living and applies obfuscation rules.
 */

import { getLogger } from './logging';

const logger = getLogger('privacy');

export interface PrivacySettings {
	enablePrivacyProtection: boolean;
	livingPersonAgeThreshold: number;
	privacyDisplayFormat: 'living' | 'private' | 'initials' | 'hidden';
	hideDetailsForLiving: boolean;
}

export interface PersonPrivacyData {
	name: string;
	birthDate?: string;
	deathDate?: string;
}

export interface PrivacyResult {
	isProtected: boolean;
	displayName: string;
	showBirthDate: boolean;
	showBirthPlace: boolean;
	showDeathDate: boolean;
	showDeathPlace: boolean;
	excludeFromOutput: boolean;
}

/**
 * Service for applying privacy rules to person data
 */
export class PrivacyService {
	private settings: PrivacySettings;

	constructor(settings: PrivacySettings) {
		this.settings = settings;
	}

	/**
	 * Update settings (e.g., when user changes them)
	 */
	updateSettings(settings: PrivacySettings): void {
		this.settings = settings;
	}

	/**
	 * Determine if a person is likely living based on available data
	 */
	isLikelyLiving(person: PersonPrivacyData): boolean {
		// If privacy protection is disabled, no one is protected
		if (!this.settings.enablePrivacyProtection) {
			return false;
		}

		// If they have a death date, they're not living
		if (person.deathDate && person.deathDate.trim() !== '') {
			return false;
		}

		// If no birth date, we can't determine - assume not living (conservative)
		if (!person.birthDate || person.birthDate.trim() === '') {
			return false;
		}

		// Parse birth year from birth date
		const birthYear = this.extractYear(person.birthDate);
		if (birthYear === null) {
			return false;
		}

		// Calculate age threshold
		const currentYear = new Date().getFullYear();
		const age = currentYear - birthYear;

		// If born within threshold years, assume living
		return age <= this.settings.livingPersonAgeThreshold;
	}

	/**
	 * Apply privacy rules to a person and return transformed data
	 */
	applyPrivacy(person: PersonPrivacyData): PrivacyResult {
		const isProtected = this.isLikelyLiving(person);

		if (!isProtected) {
			return {
				isProtected: false,
				displayName: person.name,
				showBirthDate: true,
				showBirthPlace: true,
				showDeathDate: true,
				showDeathPlace: true,
				excludeFromOutput: false
			};
		}

		// Person is protected - apply privacy rules
		logger.debug('privacy', `Applying privacy protection to: ${person.name}`);

		const displayName = this.getProtectedDisplayName(person.name);
		const hideDetails = this.settings.hideDetailsForLiving;
		const excludeFromOutput = this.settings.privacyDisplayFormat === 'hidden';

		return {
			isProtected: true,
			displayName,
			showBirthDate: !hideDetails,
			showBirthPlace: !hideDetails,
			showDeathDate: true, // Death date is fine to show (they don't have one anyway)
			showDeathPlace: true,
			excludeFromOutput
		};
	}

	/**
	 * Get the display name for a protected person based on settings
	 */
	private getProtectedDisplayName(originalName: string): string {
		switch (this.settings.privacyDisplayFormat) {
			case 'living':
				return 'Living';
			case 'private':
				return 'Private';
			case 'initials':
				return this.getInitials(originalName);
			case 'hidden':
				return ''; // Will be excluded from output
		}
	}

	/**
	 * Extract initials from a name
	 */
	private getInitials(name: string): string {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 0) return '?';

		return parts
			.map(part => part.charAt(0).toUpperCase())
			.join('.');
	}

	/**
	 * Extract year from a date string
	 * Supports various formats: YYYY, YYYY-MM-DD, DD MMM YYYY, etc.
	 */
	private extractYear(dateString: string): number | null {
		if (!dateString) return null;

		// Try to find a 4-digit year in the string
		const yearMatch = dateString.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
		if (yearMatch) {
			return parseInt(yearMatch[1], 10);
		}

		return null;
	}

	/**
	 * Filter a list of people, excluding those who should be hidden
	 */
	filterProtectedPeople<T extends PersonPrivacyData>(people: T[]): T[] {
		if (!this.settings.enablePrivacyProtection) {
			return people;
		}

		if (this.settings.privacyDisplayFormat !== 'hidden') {
			return people;
		}

		return people.filter(person => !this.isLikelyLiving(person));
	}

	/**
	 * Get a summary of privacy status for a list of people
	 */
	getPrivacySummary(people: PersonPrivacyData[]): {
		total: number;
		protected: number;
		excluded: number;
	} {
		let protectedCount = 0;
		let excludedCount = 0;

		for (const person of people) {
			const result = this.applyPrivacy(person);
			if (result.isProtected) {
				protectedCount++;
				if (result.excludeFromOutput) {
					excludedCount++;
				}
			}
		}

		return {
			total: people.length,
			protected: protectedCount,
			excluded: excludedCount
		};
	}
}

/**
 * Create a privacy service instance from plugin settings
 */
export function createPrivacyService(settings: {
	enablePrivacyProtection: boolean;
	livingPersonAgeThreshold: number;
	privacyDisplayFormat: 'living' | 'private' | 'initials' | 'hidden';
	hideDetailsForLiving: boolean;
}): PrivacyService {
	return new PrivacyService({
		enablePrivacyProtection: settings.enablePrivacyProtection,
		livingPersonAgeThreshold: settings.livingPersonAgeThreshold,
		privacyDisplayFormat: settings.privacyDisplayFormat,
		hideDetailsForLiving: settings.hideDetailsForLiving
	});
}
