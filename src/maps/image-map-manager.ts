/**
 * Image Map Manager
 *
 * Handles custom image maps for fictional worlds and historical maps.
 * Allows users to use their own map images with custom coordinate systems.
 */

import { TFile } from 'obsidian';
import type { App } from 'obsidian';
import * as L from 'leaflet';
import { getLogger } from '../core/logging';
import type { CustomMapConfig } from './types/map-types';

const logger = getLogger('ImageMapManager');

/**
 * Configuration for a custom image map stored in frontmatter
 */
export interface ImageMapFrontmatter {
	/** Type must be 'map' to be recognized */
	type: 'map';
	/** Unique identifier for this map */
	map_id: string;
	/** Display name for the map */
	name: string;
	/** Universe this map belongs to (for filtering) */
	universe: string;
	/** Path to the image file (relative to vault) */
	image: string;
	/**
	 * Coordinate system type:
	 * - 'geographic': Use lat/lng bounds (default, backward compatible)
	 * - 'pixel': Use pixel coordinates with L.CRS.Simple
	 */
	coordinate_system?: 'geographic' | 'pixel';
	/**
	 * Coordinate bounds for the image (geographic mode)
	 * For pixel mode, bounds are auto-calculated from image dimensions
	 */
	bounds?: {
		/** Southwest corner (bottom-left) */
		south: number;
		west: number;
		/** Northeast corner (top-right) */
		north: number;
		east: number;
	};
	/**
	 * Image dimensions in pixels (pixel mode)
	 * If not provided, will be auto-detected from the image
	 */
	image_dimensions?: {
		width: number;
		height: number;
	};
	/** Optional default center point (in lat/lng for geographic, x/y for pixel) */
	center?: {
		lat?: number;
		lng?: number;
		x?: number;
		y?: number;
	};
	/** Optional default zoom level */
	default_zoom?: number;
	/** Optional minimum zoom */
	min_zoom?: number;
	/** Optional maximum zoom */
	max_zoom?: number;
}

/**
 * Manages custom image maps loaded from vault
 */
export class ImageMapManager {
	private app: App;
	private mapsFolder: string;
	private mapConfigs: Map<string, CustomMapConfig> = new Map();
	private imageOverlays: Map<string, L.ImageOverlay> = new Map();

	constructor(app: App, mapsFolder: string) {
		this.app = app;
		this.mapsFolder = mapsFolder;
	}

	/**
	 * Load all custom map configurations from the vault
	 */
	async loadMapConfigs(): Promise<CustomMapConfig[]> {
		this.mapConfigs.clear();
		const configs: CustomMapConfig[] = [];

		// Look for map config files (markdown files with type: map in frontmatter)
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			// Check if file is in the maps folder or has map type
			const cache = this.app.metadataCache.getFileCache(file);
			if (!cache?.frontmatter) continue;

			const fm = cache.frontmatter;
			if (fm.type !== 'map') continue;

			try {
				const config = this.parseMapConfig(fm, file);
				if (config) {
					this.mapConfigs.set(config.id, config);
					configs.push(config);
					logger.debug('load-config', `Loaded map config: ${config.name}`, { id: config.id });
				}
			} catch (error) {
				logger.warn('parse-config', `Failed to parse map config from ${file.path}`, { error });
			}
		}

		logger.info('load-complete', `Loaded ${configs.length} custom map configs`);
		return configs;
	}

	/**
	 * Parse a map configuration from frontmatter
	 */
	private parseMapConfig(fm: Record<string, unknown>, file: TFile): CustomMapConfig | null {
		// Validate required fields
		if (!fm.map_id || !fm.name || !fm.universe || !fm.image) {
			logger.warn('invalid-config', `Map config in ${file.path} missing required fields`);
			return null;
		}

		const coordinateSystem = fm.coordinate_system === 'pixel' ? 'pixel' : 'geographic';

		// For pixel mode, bounds are optional (will be calculated from image dimensions)
		// For geographic mode, bounds are required
		if (coordinateSystem === 'geographic' && !fm.bounds) {
			logger.warn('invalid-config', `Map config in ${file.path} missing bounds (required for geographic mode)`);
			return null;
		}

		let bounds: { topLeft: { x: number; y: number }; bottomRight: { x: number; y: number } };
		let imageDimensions: { width: number; height: number } | undefined;

		if (coordinateSystem === 'pixel') {
			// For pixel mode, use image dimensions or default placeholder
			const dims = fm.image_dimensions as Record<string, unknown> | undefined;
			if (dims && typeof dims.width === 'number' && typeof dims.height === 'number') {
				imageDimensions = { width: dims.width, height: dims.height };
				// In pixel/Simple CRS: y increases upward, so bounds go from [0,0] to [height, width]
				bounds = {
					topLeft: { x: 0, y: dims.height },      // top-left in Simple CRS
					bottomRight: { x: dims.width, y: 0 }    // bottom-right in Simple CRS
				};
			} else {
				// Dimensions will be auto-detected later when loading the image
				// Use placeholder bounds
				bounds = {
					topLeft: { x: 0, y: 1000 },
					bottomRight: { x: 1000, y: 0 }
				};
			}
		} else {
			// Geographic mode - parse bounds as lat/lng
			const boundsObj = fm.bounds as Record<string, unknown>;
			if (
				typeof boundsObj.south !== 'number' ||
				typeof boundsObj.west !== 'number' ||
				typeof boundsObj.north !== 'number' ||
				typeof boundsObj.east !== 'number'
			) {
				logger.warn('invalid-bounds', `Map config in ${file.path} has invalid bounds`);
				return null;
			}

			bounds = {
				topLeft: { x: boundsObj.west as number, y: boundsObj.north as number },
				bottomRight: { x: boundsObj.east as number, y: boundsObj.south as number }
			};
		}

		const center = fm.center as Record<string, unknown> | undefined;
		let centerPoint: { x: number; y: number } | undefined;

		if (center) {
			if (coordinateSystem === 'pixel') {
				// Use x/y for pixel mode
				centerPoint = {
					x: (center.x as number) ?? (bounds.bottomRight.x / 2),
					y: (center.y as number) ?? (bounds.topLeft.y / 2)
				};
			} else {
				// Use lng/lat for geographic mode
				centerPoint = {
					x: (center.lng as number) ?? 0,
					y: (center.lat as number) ?? 0
				};
			}
		}

		return {
			id: String(fm.map_id),
			name: String(fm.name),
			universe: String(fm.universe),
			imagePath: String(fm.image),
			coordinateSystem,
			bounds,
			imageDimensions,
			center: centerPoint,
			defaultZoom: typeof fm.default_zoom === 'number' ? fm.default_zoom : (coordinateSystem === 'pixel' ? 0 : 2),
			minZoom: typeof fm.min_zoom === 'number' ? fm.min_zoom : (coordinateSystem === 'pixel' ? -2 : undefined),
			maxZoom: typeof fm.max_zoom === 'number' ? fm.max_zoom : (coordinateSystem === 'pixel' ? 4 : undefined)
		};
	}

	/**
	 * Get a map configuration by ID
	 */
	getMapConfig(mapId: string): CustomMapConfig | undefined {
		return this.mapConfigs.get(mapId);
	}

	/**
	 * Get all map configurations
	 */
	getAllConfigs(): CustomMapConfig[] {
		return [...this.mapConfigs.values()];
	}

	/**
	 * Get map configurations for a specific universe
	 */
	getConfigsForUniverse(universe: string): CustomMapConfig[] {
		return [...this.mapConfigs.values()].filter(c => c.universe === universe);
	}

	/**
	 * Create a Leaflet image overlay for a custom map
	 * For pixel coordinate maps, also auto-detects image dimensions if needed
	 */
	async createImageOverlay(mapId: string): Promise<L.ImageOverlay | null> {
		const config = this.mapConfigs.get(mapId);
		if (!config) {
			logger.warn('create-overlay', `Map config not found: ${mapId}`);
			return null;
		}

		// Check if we already have this overlay cached
		const cached = this.imageOverlays.get(mapId);
		if (cached) {
			return cached;
		}

		try {
			const imageUrl = await this.getImageUrl(config.imagePath);
			if (!imageUrl) {
				logger.error('image-not-found', `Image not found: ${config.imagePath}`);
				return null;
			}

			// For pixel coordinate system, auto-detect dimensions if not provided
			if (config.coordinateSystem === 'pixel' && !config.imageDimensions) {
				const dimensions = await this.getImageDimensions(imageUrl);
				if (dimensions) {
					config.imageDimensions = dimensions;
					// Update bounds based on actual image dimensions
					config.bounds = {
						topLeft: { x: 0, y: dimensions.height },
						bottomRight: { x: dimensions.width, y: 0 }
					};
					logger.debug('auto-detect-dimensions', `Auto-detected image dimensions: ${dimensions.width}x${dimensions.height}`);
				}
			}

			// Create bounds based on coordinate system
			let bounds: L.LatLngBounds;

			if (config.coordinateSystem === 'pixel') {
				// For Simple CRS: [y, x] format where y=0 is bottom
				// Image bounds: [[0, 0], [height, width]]
				bounds = L.latLngBounds(
					[0, 0],                                                    // Southwest (bottom-left)
					[config.bounds.topLeft.y, config.bounds.bottomRight.x]     // Northeast (top-right)
				);
			} else {
				// Geographic mode: standard lat/lng bounds
				bounds = L.latLngBounds(
					[config.bounds.bottomRight.y, config.bounds.topLeft.x],   // Southwest (bottom-left)
					[config.bounds.topLeft.y, config.bounds.bottomRight.x]    // Northeast (top-right)
				);
			}

			const overlay = L.imageOverlay(imageUrl, bounds, {
				opacity: 1,
				interactive: false
			});

			this.imageOverlays.set(mapId, overlay);
			logger.debug('create-overlay', `Created image overlay for ${config.name} (${config.coordinateSystem} mode)`);
			return overlay;
		} catch (error) {
			logger.error('create-overlay-error', `Failed to create overlay for ${mapId}`, { error });
		}

		return null;
	}

	/**
	 * Get the coordinate system for a map
	 */
	getCoordinateSystem(mapId: string): 'geographic' | 'pixel' {
		const config = this.mapConfigs.get(mapId);
		return config?.coordinateSystem ?? 'geographic';
	}

	/**
	 * Get image dimensions by loading the image
	 */
	private async getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			};
			img.onerror = () => {
				logger.warn('image-dimensions', 'Failed to load image for dimension detection');
				resolve(null);
			};
			img.src = imageUrl;
		});
	}

	/**
	 * Get a data URL for an image in the vault
	 */
	private async getImageUrl(imagePath: string): Promise<string | null> {
		try {
			const file = this.app.vault.getAbstractFileByPath(imagePath);
			if (file && file instanceof TFile) {
				const arrayBuffer = await this.app.vault.readBinary(file);
				const blob = new Blob([arrayBuffer]);
				return URL.createObjectURL(blob);
			}

			// Try with vault adapter directly
			const exists = await this.app.vault.adapter.exists(imagePath);
			if (exists) {
				const data = await this.app.vault.adapter.readBinary(imagePath);
				const blob = new Blob([data]);
				return URL.createObjectURL(blob);
			}

			return null;
		} catch (error) {
			logger.error('get-image-url', `Failed to get image URL for ${imagePath}`, { error });
			return null;
		}
	}

	/**
	 * Get the Leaflet bounds for a custom map
	 */
	getMapBounds(mapId: string): L.LatLngBounds | null {
		const config = this.mapConfigs.get(mapId);
		if (!config) return null;

		return L.latLngBounds(
			[config.bounds.bottomRight.y, config.bounds.topLeft.x],   // Southwest
			[config.bounds.topLeft.y, config.bounds.bottomRight.x]    // Northeast
		);
	}

	/**
	 * Get the default center for a custom map
	 */
	getMapCenter(mapId: string): L.LatLng | null {
		const config = this.mapConfigs.get(mapId);
		if (!config) return null;

		if (config.center) {
			return L.latLng(config.center.y, config.center.x);
		}

		// Calculate center from bounds
		const bounds = this.getMapBounds(mapId);
		return bounds?.getCenter() ?? null;
	}

	/**
	 * Get the default zoom for a custom map
	 */
	getDefaultZoom(mapId: string): number {
		const config = this.mapConfigs.get(mapId);
		return config?.defaultZoom ?? 2;
	}

	/**
	 * Get the universe for a custom map
	 */
	getMapUniverse(mapId: string): string | null {
		const config = this.mapConfigs.get(mapId);
		return config?.universe ?? null;
	}

	/**
	 * Clean up resources (revoke object URLs)
	 */
	destroy(): void {
		// Revoke any object URLs we created
		for (const overlay of this.imageOverlays.values()) {
			const url = (overlay as L.ImageOverlay).getElement()?.src;
			if (url && url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		}
		this.imageOverlays.clear();
		this.mapConfigs.clear();
	}
}

/**
 * Example map configuration files:
 *
 * ## Geographic Coordinate System (default)
 * Use this when you want to define arbitrary lat/lng-style coordinates for your map.
 *
 * ```yaml
 * ---
 * type: map
 * map_id: middle-earth
 * name: Middle-earth
 * universe: tolkien
 * image: assets/maps/middle-earth.jpg
 * coordinate_system: geographic
 * bounds:
 *   north: 50
 *   south: -50
 *   west: -100
 *   east: 100
 * center:
 *   lat: 0
 *   lng: 0
 * default_zoom: 3
 * min_zoom: 1
 * max_zoom: 6
 * ---
 *
 * # Middle-earth Map
 *
 * Place coordinates use lat/lng values within the defined bounds.
 * ```
 *
 * ## Pixel Coordinate System
 * Use this when you want to place markers directly using pixel coordinates.
 * This is ideal for custom maps where you want coordinates to match image editor positions.
 *
 * ```yaml
 * ---
 * type: map
 * map_id: westeros
 * name: Westeros
 * universe: got
 * image: assets/maps/westeros.png
 * coordinate_system: pixel
 * image_dimensions:
 *   width: 2048
 *   height: 3072
 * center:
 *   x: 1024
 *   y: 1536
 * default_zoom: 0
 * min_zoom: -2
 * max_zoom: 3
 * ---
 *
 * # Westeros Map
 *
 * Place coordinates use pixel positions (x, y) where:
 * - x: 0 is the left edge, increases rightward
 * - y: 0 is the bottom edge, increases upward
 *
 * Tip: Use an image editor to find pixel coordinates for places.
 * Note: If image_dimensions is omitted, it will be auto-detected.
 * ```
 *
 * ## Place Note Example (Pixel Mode)
 *
 * ```yaml
 * ---
 * type: place
 * cr_id: winterfell
 * name: Winterfell
 * universe: got
 * pixel_coordinates:
 *   x: 1200
 *   y: 2400
 * ---
 * ```
 */
