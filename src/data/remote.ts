/**
 * Remote data fetching with fallback to bundled data
 */

import type { CloudRegion, CloudProviderInfo } from '../types/index.js';
import { allRegions as bundledRegions } from './index.js';
import { providers as bundledProviders } from './providers.js';
import { dataMetadata as bundledMetadata } from './metadata.js';

// GitHub raw URL for the regions.json file
const REMOTE_DATA_URL = 'https://raw.githubusercontent.com/jasonwilbur/mcp-server-cloud-regions/main/data/regions.json';

// Cache timeout in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

interface RemoteData {
  metadata: typeof bundledMetadata & { exportedAt: string };
  providers: CloudProviderInfo[];
  regions: CloudRegion[];
}

interface CachedData {
  data: RemoteData;
  fetchedAt: number;
}

let cachedData: CachedData | null = null;

/**
 * Fetch remote region data with fallback to bundled data
 */
export async function fetchRegionData(): Promise<{
  regions: CloudRegion[];
  providers: CloudProviderInfo[];
  metadata: typeof bundledMetadata;
  source: 'remote' | 'bundled';
}> {
  // Check cache
  if (cachedData && Date.now() - cachedData.fetchedAt < CACHE_TTL) {
    return {
      regions: cachedData.data.regions,
      providers: cachedData.data.providers,
      metadata: cachedData.data.metadata,
      source: 'remote',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(REMOTE_DATA_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'mcp-server-cloud-regions',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const remoteData = await response.json() as RemoteData;

    // Validate the data has expected structure
    if (!remoteData.regions || !Array.isArray(remoteData.regions)) {
      throw new Error('Invalid remote data structure');
    }

    // Cache the result
    cachedData = {
      data: remoteData,
      fetchedAt: Date.now(),
    };

    return {
      regions: remoteData.regions,
      providers: remoteData.providers,
      metadata: remoteData.metadata,
      source: 'remote',
    };
  } catch (error) {
    // Fallback to bundled data
    console.error(`Failed to fetch remote data, using bundled data: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      regions: bundledRegions,
      providers: bundledProviders,
      metadata: bundledMetadata,
      source: 'bundled',
    };
  }
}

/**
 * Get bundled data (no network call)
 */
export function getBundledData() {
  return {
    regions: bundledRegions,
    providers: bundledProviders,
    metadata: bundledMetadata,
  };
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache() {
  cachedData = null;
}
