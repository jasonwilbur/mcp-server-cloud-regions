import type {
  CloudRegion,
  RegionFilter,
  NearbySearch,
  RegionWithDistance,
  CloudProvider,
  ProviderTier,
  ComplianceCertification,
  RegionType,
} from '../types/index.js';
import {
  allRegions,
  regionMap,
  providers,
  providerMap,
  getRegionsByProvider,
  getRegionsByCountry,
  getRegionsByContinent,
} from '../data/index.js';

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Apply filters to a list of regions
 */
function applyFilters(regions: CloudRegion[], filter: RegionFilter): CloudRegion[] {
  return regions.filter((region) => {
    // Filter by providers
    if (filter.providers && filter.providers.length > 0) {
      if (!filter.providers.includes(region.provider)) return false;
    }

    // Filter by provider tiers
    if (filter.tiers && filter.tiers.length > 0) {
      const providerInfo = providerMap.get(region.provider);
      if (!providerInfo || !filter.tiers.includes(providerInfo.tier)) return false;
    }

    // Filter by country codes
    if (filter.countryCodes && filter.countryCodes.length > 0) {
      if (!filter.countryCodes.includes(region.location.countryCode)) return false;
    }

    // Filter by continents
    if (filter.continents && filter.continents.length > 0) {
      if (!filter.continents.includes(region.location.continent)) return false;
    }

    // Filter by compliance (must have ALL specified certifications)
    if (filter.compliance && filter.compliance.length > 0) {
      if (!region.compliance) return false;
      for (const cert of filter.compliance) {
        if (!region.compliance.includes(cert)) return false;
      }
    }

    // Filter by carbon neutral
    if (filter.carbonNeutral === true) {
      if (!region.sustainability?.carbonNeutral) return false;
    }

    // Filter by GPU availability
    if (filter.hasGpu === true) {
      if (!region.services?.gpu) return false;
    }

    // Filter by status
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(region.status)) return false;
    }

    // Filter by region types
    if (filter.regionTypes && filter.regionTypes.length > 0) {
      if (!filter.regionTypes.includes(region.regionType)) return false;
    }

    // Filter by data residency
    if (filter.dataResidency) {
      if (region.sovereignty?.dataResidency !== filter.dataResidency) return false;
    }

    // Filter by minimum availability zones
    if (filter.minAvailabilityZones !== undefined) {
      if ((region.availabilityZones ?? 0) < filter.minAvailabilityZones) return false;
    }

    return true;
  });
}

// ============================================================================
// Tool Implementations
// ============================================================================

/**
 * List all regions with optional filtering
 */
export function listRegions(filter?: RegionFilter): CloudRegion[] {
  if (!filter) return allRegions;
  return applyFilters(allRegions, filter);
}

/**
 * Get a specific region by ID
 */
export function getRegion(id: string): CloudRegion | undefined {
  return regionMap.get(id);
}

/**
 * List all providers
 */
export function listProviders(tier?: ProviderTier) {
  if (!tier) return providers;
  return providers.filter((p) => p.tier === tier);
}

/**
 * Get regions for a specific provider
 */
export function getProviderRegions(providerId: CloudProvider): CloudRegion[] {
  return allRegions.filter((r) => r.provider === providerId);
}

/**
 * Find regions near a geographic location
 */
export function findNearbyRegions(search: NearbySearch): RegionWithDistance[] {
  let regions = allRegions;

  // Apply filters first if provided
  if (search.filter) {
    regions = applyFilters(regions, search.filter);
  }

  // Calculate distances
  const withDistances: RegionWithDistance[] = regions.map((region) => ({
    ...region,
    distanceKm: Math.round(
      haversineDistance(
        search.latitude,
        search.longitude,
        region.location.latitude,
        region.location.longitude
      )
    ),
  }));

  // Sort by distance
  withDistances.sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter by max distance if specified
  let result = withDistances;
  if (search.maxDistanceKm !== undefined) {
    result = withDistances.filter((r) => r.distanceKm <= search.maxDistanceKm!);
  }

  // Limit results if specified
  if (search.limit !== undefined) {
    result = result.slice(0, search.limit);
  }

  return result;
}

/**
 * Search regions by text query (searches display name, city, country)
 */
export function searchRegions(query: string, filter?: RegionFilter): CloudRegion[] {
  const lowerQuery = query.toLowerCase();
  let regions = allRegions;

  if (filter) {
    regions = applyFilters(regions, filter);
  }

  return regions.filter((region) => {
    return (
      region.displayName.toLowerCase().includes(lowerQuery) ||
      region.regionCode.toLowerCase().includes(lowerQuery) ||
      region.location.city.toLowerCase().includes(lowerQuery) ||
      region.location.country.toLowerCase().includes(lowerQuery) ||
      region.provider.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Get summary statistics
 */
export function getStatistics() {
  const byProvider = getRegionsByProvider();
  const byCountry = getRegionsByCountry();
  const byContinent = getRegionsByContinent();

  const providerCounts: Record<string, number> = {};
  for (const [provider, regions] of byProvider) {
    providerCounts[provider] = regions.length;
  }

  const countryCounts: Record<string, number> = {};
  for (const [country, regions] of byCountry) {
    countryCounts[country] = regions.length;
  }

  const continentCounts: Record<string, number> = {};
  for (const [continent, regions] of byContinent) {
    continentCounts[continent] = regions.length;
  }

  const gpuRegions = allRegions.filter((r) => r.services?.gpu).length;
  const carbonNeutralRegions = allRegions.filter((r) => r.sustainability?.carbonNeutral).length;

  // Count by region type
  const byRegionType: Record<string, number> = {};
  for (const region of allRegions) {
    byRegionType[region.regionType] = (byRegionType[region.regionType] ?? 0) + 1;
  }

  return {
    totalRegions: allRegions.length,
    totalProviders: providers.length,
    byProvider: providerCounts,
    byCountry: countryCounts,
    byContinent: continentCounts,
    byRegionType,
    gpuRegions,
    carbonNeutralRegions,
  };
}

/**
 * Find regions with specific compliance certifications
 */
export function findCompliantRegions(
  certifications: ComplianceCertification[],
  filter?: RegionFilter
): CloudRegion[] {
  const combinedFilter: RegionFilter = {
    ...filter,
    compliance: certifications,
  };
  return applyFilters(allRegions, combinedFilter);
}

/**
 * Find carbon neutral/sustainable regions
 */
export function findSustainableRegions(filter?: RegionFilter): CloudRegion[] {
  const combinedFilter: RegionFilter = {
    ...filter,
    carbonNeutral: true,
  };
  return applyFilters(allRegions, combinedFilter);
}

/**
 * Find regions with GPU availability
 */
export function findGpuRegions(gpuType?: string, filter?: RegionFilter): CloudRegion[] {
  let regions = applyFilters(allRegions, { ...filter, hasGpu: true });

  if (gpuType) {
    const lowerGpuType = gpuType.toLowerCase();
    regions = regions.filter((r) =>
      r.services?.gpuTypes?.some((g) => g.toLowerCase().includes(lowerGpuType))
    );
  }

  return regions;
}

/**
 * Compare providers by region count in specific areas
 */
export function compareProviderCoverage(
  countryCode?: string,
  continent?: string
): Record<string, number> {
  const filter: RegionFilter = {};
  if (countryCode) filter.countryCodes = [countryCode];
  if (continent) filter.continents = [continent as any];

  const filtered = Object.keys(filter).length > 0 ? applyFilters(allRegions, filter) : allRegions;

  const counts: Record<string, number> = {};
  for (const region of filtered) {
    counts[region.provider] = (counts[region.provider] ?? 0) + 1;
  }

  return counts;
}

/**
 * Get all unique countries with cloud regions
 */
export function listCountries(): { countryCode: string; country: string; regionCount: number }[] {
  const countries = new Map<string, { country: string; count: number }>();

  for (const region of allRegions) {
    const existing = countries.get(region.location.countryCode);
    if (existing) {
      existing.count++;
    } else {
      countries.set(region.location.countryCode, {
        country: region.location.country,
        count: 1,
      });
    }
  }

  return Array.from(countries.entries())
    .map(([countryCode, data]) => ({
      countryCode,
      country: data.country,
      regionCount: data.count,
    }))
    .sort((a, b) => b.regionCount - a.regionCount);
}

/**
 * Get all unique cities with cloud regions
 */
export function listCities(): { city: string; country: string; providers: string[]; regionCount: number }[] {
  const cities = new Map<string, { country: string; providers: Set<string>; count: number }>();

  for (const region of allRegions) {
    const key = `${region.location.city}-${region.location.countryCode}`;
    const existing = cities.get(key);
    if (existing) {
      existing.providers.add(region.provider);
      existing.count++;
    } else {
      cities.set(key, {
        country: region.location.country,
        providers: new Set([region.provider]),
        count: 1,
      });
    }
  }

  return Array.from(cities.entries())
    .map(([key, data]) => ({
      city: key.split('-')[0],
      country: data.country,
      providers: Array.from(data.providers),
      regionCount: data.count,
    }))
    .sort((a, b) => b.regionCount - a.regionCount);
}
