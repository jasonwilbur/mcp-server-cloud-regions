import { describe, it, expect, beforeAll } from 'vitest';
import { getBundledData } from '../src/data/remote.js';
import { initializeStore, getRegions } from '../src/data/store.js';
import {
  getRegion,
  findNearbyRegions,
  findCompliantRegions,
  compareProviderCoverage,
} from '../src/tools/index.js';
import type { CloudProvider } from '../src/types/index.js';

const PROVIDERS: CloudProvider[] = [
  'aws', 'azure', 'gcp', 'oci',
  'digitalocean', 'linode', 'vultr',
  'crusoe', 'coreweave', 'lambda', 'paperspace',
  'ovh', 'hetzner', 'scaleway',
];

beforeAll(() => {
  // Load the bundled data into the store (no network).
  initializeStore(getBundledData());
});

describe('region data integrity', () => {
  it('has a healthy number of regions', () => {
    expect(getRegions().length).toBeGreaterThan(200);
  });

  it('every region is well-formed', () => {
    const seen = new Set<string>();
    for (const r of getRegions()) {
      // Unique id, and id must equal `${provider}-${regionCode}`
      // (case-insensitive: a few providers, e.g. CoreWeave, use uppercase
      // region codes in the id but lowercase in regionCode).
      expect(seen.has(r.id)).toBe(false);
      seen.add(r.id);
      expect(r.id.toLowerCase()).toBe(`${r.provider}-${r.regionCode}`.toLowerCase());

      // Provider is in the known union.
      expect(PROVIDERS).toContain(r.provider);

      // Valid 2-letter country code.
      expect(r.location.countryCode).toMatch(/^[A-Z]{2}$/);

      // Coordinates in range.
      expect(r.location.latitude).toBeGreaterThanOrEqual(-90);
      expect(r.location.latitude).toBeLessThanOrEqual(90);
      expect(r.location.longitude).toBeGreaterThanOrEqual(-180);
      expect(r.location.longitude).toBeLessThanOrEqual(180);
    }
  });
});

describe('tools', () => {
  it('getRegion returns a known region and undefined for a miss', () => {
    const known = getRegions()[0];
    expect(getRegion(known.id)?.id).toBe(known.id);
    expect(getRegion('does-not-exist')).toBeUndefined();
  });

  it('findNearbyRegions returns results ordered by ascending distance', () => {
    // Near Frankfurt, Germany.
    const results = findNearbyRegions({ latitude: 50.11, longitude: 8.68, limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    const distances = results.map((r) => r.distanceKm);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('findCompliantRegions only returns regions carrying every requested cert', () => {
    const results = findCompliantRegions(['HIPAA']);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.compliance).toContain('HIPAA');
    }
  });

  it('compareProviderCoverage scopes to a country', () => {
    const coverage = compareProviderCoverage('US', undefined);
    expect(coverage).toBeTruthy();
  });
});
