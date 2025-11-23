/**
 * Per-Canvas Style Overrides
 *
 * Allows individual canvases to override global plugin style settings.
 * Style overrides are stored in canvas metadata and preserved during regeneration.
 */

import type { ArrowStyle, ColorScheme, CanvasColor, SpouseEdgeLabelFormat } from '../settings';

/**
 * Style settings that can be overridden on a per-canvas basis.
 * All fields are optional - undefined means "use global setting".
 */
export interface StyleOverrides {
	/**
	 * Node color scheme override
	 * - 'gender': Color by gender (green for male, purple for female)
	 * - 'generation': Color by generation level (creates visual layers)
	 * - 'collection': Color by collection (different color per collection)
	 * - 'monochrome': No coloring (neutral for all nodes)
	 * - undefined: Use global setting
	 */
	nodeColorScheme?: ColorScheme;

	/**
	 * Arrow style for parent-child relationships
	 * - 'directed': Single arrow pointing to child (default)
	 * - 'bidirectional': Arrows on both ends
	 * - 'undirected': No arrows (just lines)
	 * - undefined: Use global setting
	 */
	parentChildArrowStyle?: ArrowStyle;

	/**
	 * Arrow style for spouse relationships
	 * - 'directed': Single arrow
	 * - 'bidirectional': Arrows on both ends
	 * - 'undirected': No arrows (cleaner look, default)
	 * - undefined: Use global setting
	 */
	spouseArrowStyle?: ArrowStyle;

	/**
	 * Edge color for parent-child relationships
	 * - '1' through '6': Obsidian's preset colors
	 * - 'none': No color (theme default)
	 * - undefined: Use global setting
	 */
	parentChildEdgeColor?: CanvasColor;

	/**
	 * Edge color for spouse relationships
	 * - '1' through '6': Obsidian's preset colors
	 * - 'none': No color (theme default)
	 * - undefined: Use global setting
	 */
	spouseEdgeColor?: CanvasColor;

	/**
	 * Whether to show spouse edges with marriage metadata
	 * - true: Show spouse edges
	 * - false: Hide spouse edges
	 * - undefined: Use global setting
	 */
	showSpouseEdges?: boolean;

	/**
	 * Format for spouse edge labels
	 * - 'none': No labels
	 * - 'date-only': Just marriage date (e.g., "m. 1985")
	 * - 'date-location': Date and location (e.g., "m. 1985 | Boston, MA")
	 * - 'full': Date, location, and status (e.g., "m. 1985 | Boston, MA | div. 1992")
	 * - undefined: Use global setting
	 */
	spouseEdgeLabelFormat?: SpouseEdgeLabelFormat;
}

/**
 * Merge global settings with canvas-specific overrides.
 * Returns a complete style configuration with all values defined.
 *
 * @param globalSettings - Global plugin settings
 * @param overrides - Canvas-specific style overrides (optional)
 * @returns Complete style configuration with all values defined
 */
export function mergeStyleSettings(
	globalSettings: {
		nodeColorScheme: ColorScheme;
		parentChildArrowStyle: ArrowStyle;
		spouseArrowStyle: ArrowStyle;
		parentChildEdgeColor: CanvasColor;
		spouseEdgeColor: CanvasColor;
		showSpouseEdges: boolean;
		spouseEdgeLabelFormat: SpouseEdgeLabelFormat;
	},
	overrides?: StyleOverrides
): {
	nodeColorScheme: ColorScheme;
	parentChildArrowStyle: ArrowStyle;
	spouseArrowStyle: ArrowStyle;
	parentChildEdgeColor: CanvasColor;
	spouseEdgeColor: CanvasColor;
	showSpouseEdges: boolean;
	spouseEdgeLabelFormat: SpouseEdgeLabelFormat;
} {
	if (!overrides) {
		return globalSettings;
	}

	return {
		nodeColorScheme: overrides.nodeColorScheme ?? globalSettings.nodeColorScheme,
		parentChildArrowStyle: overrides.parentChildArrowStyle ?? globalSettings.parentChildArrowStyle,
		spouseArrowStyle: overrides.spouseArrowStyle ?? globalSettings.spouseArrowStyle,
		parentChildEdgeColor: overrides.parentChildEdgeColor ?? globalSettings.parentChildEdgeColor,
		spouseEdgeColor: overrides.spouseEdgeColor ?? globalSettings.spouseEdgeColor,
		showSpouseEdges: overrides.showSpouseEdges ?? globalSettings.showSpouseEdges,
		spouseEdgeLabelFormat: overrides.spouseEdgeLabelFormat ?? globalSettings.spouseEdgeLabelFormat
	};
}

/**
 * Check if style overrides object has any values defined.
 * Used to determine if custom styles are applied to a canvas.
 *
 * @param overrides - Style overrides to check
 * @returns True if at least one override is defined, false otherwise
 */
export function hasStyleOverrides(overrides?: StyleOverrides): boolean {
	if (!overrides) return false;

	return (
		overrides.nodeColorScheme !== undefined ||
		overrides.parentChildArrowStyle !== undefined ||
		overrides.spouseArrowStyle !== undefined ||
		overrides.parentChildEdgeColor !== undefined ||
		overrides.spouseEdgeColor !== undefined ||
		overrides.showSpouseEdges !== undefined ||
		overrides.spouseEdgeLabelFormat !== undefined
	);
}

/**
 * Create a default/empty StyleOverrides object.
 * Used when initializing new canvas style customization.
 *
 * @returns Empty StyleOverrides object
 */
export function createEmptyStyleOverrides(): StyleOverrides {
	return {};
}

/**
 * Clone style overrides object.
 * Used when copying styles between canvases or creating templates.
 *
 * @param overrides - Style overrides to clone
 * @returns Cloned StyleOverrides object
 */
export function cloneStyleOverrides(overrides?: StyleOverrides): StyleOverrides {
	if (!overrides) return {};

	return {
		nodeColorScheme: overrides.nodeColorScheme,
		parentChildArrowStyle: overrides.parentChildArrowStyle,
		spouseArrowStyle: overrides.spouseArrowStyle,
		parentChildEdgeColor: overrides.parentChildEdgeColor,
		spouseEdgeColor: overrides.spouseEdgeColor,
		showSpouseEdges: overrides.showSpouseEdges,
		spouseEdgeLabelFormat: overrides.spouseEdgeLabelFormat
	};
}
