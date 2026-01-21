/**
 * Runtime data store for cloud regions
 *
 * This module provides a mutable store that can be initialized with remote data
 * or fall back to bundled data. Tools import from here to get the current data.
 */

import type { CloudRegion, CloudProviderInfo } from '../types/index.js';
import { allRegions as bundledRegions } from './index.js';
import { providers as bundledProviders, providerMap as bundledProviderMap } from './providers.js';
import { dataMetadata as bundledMetadata } from './metadata.js';

interface DataStore {
  regions: CloudRegion[];
  providers: CloudProviderInfo[];
  metadata: typeof bundledMetadata & { exportedAt?: string };
  source: 'remote' | 'bundled';
  regionMap: Map<string, CloudRegion>;
  providerMap: Map<string, CloudProviderInfo>;
}

// Initialize with bundled data
const store: DataStore = {
  regions: bundledRegions,
  providers: bundledProviders,
  metadata: bundledMetadata,
  source: 'bundled',
  regionMap: new Map(bundledRegions.map((r) => [r.id, r])),
  providerMap: bundledProviderMap,
};

/**
 * Initialize the store with new data (typically from remote fetch)
 */
export function initializeStore(data: {
  regions: CloudRegion[];
  providers: CloudProviderInfo[];
  metadata: typeof bundledMetadata & { exportedAt?: string };
  source: 'remote' | 'bundled';
}): void {
  store.regions = data.regions;
  store.providers = data.providers;
  store.metadata = data.metadata;
  store.source = data.source;
  store.regionMap = new Map(data.regions.map((r) => [r.id, r]));
  store.providerMap = new Map(data.providers.map((p) => [p.id, p]));
}

/**
 * Get all regions
 */
export function getRegions(): CloudRegion[] {
  return store.regions;
}

/**
 * Get region by ID
 */
export function getRegionById(id: string): CloudRegion | undefined {
  return store.regionMap.get(id);
}

/**
 * Get all providers
 */
export function getProviders(): CloudProviderInfo[] {
  return store.providers;
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): CloudProviderInfo | undefined {
  return store.providerMap.get(id);
}

/**
 * Get current metadata with accurate counts
 */
export function getMetadata() {
  return {
    ...store.metadata,
    totalRegions: store.regions.length,
    totalProviders: store.providers.length,
  };
}

/**
 * Get the data source ('remote' or 'bundled')
 */
export function getDataSource(): 'remote' | 'bundled' {
  return store.source;
}

/**
 * Get regions grouped by provider
 */
export function getRegionsByProvider(): Map<string, CloudRegion[]> {
  const grouped = new Map<string, CloudRegion[]>();
  for (const region of store.regions) {
    const existing = grouped.get(region.provider) ?? [];
    existing.push(region);
    grouped.set(region.provider, existing);
  }
  return grouped;
}

/**
 * Get regions grouped by country
 */
export function getRegionsByCountry(): Map<string, CloudRegion[]> {
  const grouped = new Map<string, CloudRegion[]>();
  for (const region of store.regions) {
    const countryCode = region.location.countryCode;
    const existing = grouped.get(countryCode) ?? [];
    existing.push(region);
    grouped.set(countryCode, existing);
  }
  return grouped;
}

/**
 * Get regions grouped by continent
 */
export function getRegionsByContinent(): Map<string, CloudRegion[]> {
  const grouped = new Map<string, CloudRegion[]>();
  for (const region of store.regions) {
    const continent = region.location.continent;
    const existing = grouped.get(continent) ?? [];
    existing.push(region);
    grouped.set(continent, existing);
  }
  return grouped;
}
