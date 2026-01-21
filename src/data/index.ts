import type { CloudRegion } from '../types/index.js';
import { awsRegions } from './regions-aws.js';
import { azureRegions } from './regions-azure.js';
import { gcpRegions } from './regions-gcp.js';
import {
  ociRegions,
  digitaloceanRegions,
  crusoeRegions,
  coreweaveRegions,
  lambdaRegions,
  hetznerRegions,
  scalewayRegions,
  vultrRegions,
  linodeRegions,
  ovhRegions,
} from './regions-others.js';

export { providers, providerMap } from './providers.js';

/**
 * All cloud regions from all providers
 */
export const allRegions: CloudRegion[] = [
  ...awsRegions,
  ...azureRegions,
  ...gcpRegions,
  ...ociRegions,
  ...digitaloceanRegions,
  ...crusoeRegions,
  ...coreweaveRegions,
  ...lambdaRegions,
  ...hetznerRegions,
  ...scalewayRegions,
  ...vultrRegions,
  ...linodeRegions,
  ...ovhRegions,
];

/**
 * Map of region ID to region data for fast lookups
 */
export const regionMap = new Map<string, CloudRegion>(
  allRegions.map((r) => [r.id, r])
);

/**
 * Get regions grouped by provider
 */
export function getRegionsByProvider(): Map<string, CloudRegion[]> {
  const grouped = new Map<string, CloudRegion[]>();
  for (const region of allRegions) {
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
  for (const region of allRegions) {
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
  for (const region of allRegions) {
    const continent = region.location.continent;
    const existing = grouped.get(continent) ?? [];
    existing.push(region);
    grouped.set(continent, existing);
  }
  return grouped;
}

// Re-export individual region arrays for direct access
export {
  awsRegions,
  azureRegions,
  gcpRegions,
  ociRegions,
  digitaloceanRegions,
  crusoeRegions,
  coreweaveRegions,
  lambdaRegions,
  hetznerRegions,
  scalewayRegions,
  vultrRegions,
  linodeRegions,
  ovhRegions,
};
