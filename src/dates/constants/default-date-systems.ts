/**
 * Built-in Fictional Date System Presets
 *
 * Common calendar systems for popular fictional universes.
 * Users can enable/disable these and create their own.
 */

import type { FictionalDateSystem } from '../types/date-types';

/**
 * Middle-earth Calendar (Tolkien's Legendarium)
 *
 * Covers the major ages of Arda:
 * - First Age (FA): ~600 years, ends with defeat of Morgoth
 * - Second Age (SA): 3441 years, ends with defeat of Sauron
 * - Third Age (TA): 3021 years, ends with departure of Ring-bearers
 * - Fourth Age (FoA): Age of Men
 *
 * Note: Actual First Age length is debated; we use a simplified model
 * where FA years map relative to TA as the primary reference.
 */
export const MIDDLE_EARTH_CALENDAR: FictionalDateSystem = {
	id: 'middle_earth',
	name: 'Middle-earth Calendar',
	universe: 'middle-earth',
	builtIn: true,
	eras: [
		{
			id: 'first_age',
			name: 'First Age',
			abbrev: 'FA',
			epoch: -6500, // Approximate: SA started ~3500 years before TA
			direction: 'forward'
		},
		{
			id: 'second_age',
			name: 'Second Age',
			abbrev: 'SA',
			epoch: -3441, // SA 3441 = TA 0, so SA 1 = -3441 + 1 = -3440
			direction: 'forward'
		},
		{
			id: 'third_age',
			name: 'Third Age',
			abbrev: 'TA',
			epoch: 0, // Reference point
			direction: 'forward'
		},
		{
			id: 'fourth_age',
			name: 'Fourth Age',
			abbrev: 'FoA',
			epoch: 3021, // TA 3021 = FoA 1
			direction: 'forward'
		}
	],
	defaultEra: 'third_age'
};

/**
 * Westeros Calendar (A Song of Ice and Fire / Game of Thrones)
 *
 * Uses Aegon's Conquest as epoch:
 * - BC (Before Conquest): Years before Aegon's landing
 * - AC (After Conquest): Years after Aegon's landing
 */
export const WESTEROS_CALENDAR: FictionalDateSystem = {
	id: 'westeros',
	name: 'Westeros Calendar',
	universe: 'westeros',
	builtIn: true,
	eras: [
		{
			id: 'before_conquest',
			name: 'Before Conquest',
			abbrev: 'BC',
			epoch: 0,
			direction: 'backward' // BC years count backward
		},
		{
			id: 'after_conquest',
			name: 'After Conquest',
			abbrev: 'AC',
			epoch: 0,
			direction: 'forward'
		}
	],
	defaultEra: 'after_conquest'
};

/**
 * Star Wars Calendar (Galactic Standard)
 *
 * Uses the Battle of Yavin as epoch:
 * - BBY (Before the Battle of Yavin)
 * - ABY (After the Battle of Yavin)
 */
export const STAR_WARS_CALENDAR: FictionalDateSystem = {
	id: 'star_wars',
	name: 'Galactic Standard Calendar',
	universe: 'star-wars',
	builtIn: true,
	eras: [
		{
			id: 'before_yavin',
			name: 'Before the Battle of Yavin',
			abbrev: 'BBY',
			epoch: 0,
			direction: 'backward'
		},
		{
			id: 'after_yavin',
			name: 'After the Battle of Yavin',
			abbrev: 'ABY',
			epoch: 0,
			direction: 'forward'
		}
	],
	defaultEra: 'after_yavin'
};

/**
 * Generic Fantasy Calendar
 *
 * A simple numbered age system for custom worlds.
 */
export const GENERIC_FANTASY_CALENDAR: FictionalDateSystem = {
	id: 'generic_fantasy',
	name: 'Fantasy Ages',
	builtIn: true,
	eras: [
		{
			id: 'age_1',
			name: 'First Age',
			abbrev: 'A1',
			epoch: -2000,
			direction: 'forward'
		},
		{
			id: 'age_2',
			name: 'Second Age',
			abbrev: 'A2',
			epoch: -1000,
			direction: 'forward'
		},
		{
			id: 'age_3',
			name: 'Third Age',
			abbrev: 'A3',
			epoch: 0,
			direction: 'forward'
		},
		{
			id: 'age_4',
			name: 'Fourth Age',
			abbrev: 'A4',
			epoch: 1000,
			direction: 'forward'
		}
	],
	defaultEra: 'age_3'
};

/**
 * All built-in date systems
 */
export const DEFAULT_DATE_SYSTEMS: FictionalDateSystem[] = [
	MIDDLE_EARTH_CALENDAR,
	WESTEROS_CALENDAR,
	STAR_WARS_CALENDAR,
	GENERIC_FANTASY_CALENDAR
];

/**
 * Get a built-in date system by ID
 */
export function getDefaultDateSystem(id: string): FictionalDateSystem | undefined {
	return DEFAULT_DATE_SYSTEMS.find(s => s.id === id);
}

/**
 * Get built-in date systems for a specific universe
 */
export function getDefaultDateSystemsForUniverse(universe: string): FictionalDateSystem[] {
	const universeLower = universe.toLowerCase();
	return DEFAULT_DATE_SYSTEMS.filter(
		s => s.universe?.toLowerCase() === universeLower
	);
}
