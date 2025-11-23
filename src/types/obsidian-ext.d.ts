/**
 * Type extensions for Obsidian API
 *
 * This file extends the official Obsidian type definitions with methods
 * that exist at runtime but aren't included in the published types.
 */

import 'obsidian';

declare module 'obsidian' {
	interface MenuItem {
		/**
		 * Creates a submenu for this menu item (desktop only)
		 * @returns A Menu object that can have items added to it
		 * @public
		 */
		setSubmenu(): Menu;
	}
}
