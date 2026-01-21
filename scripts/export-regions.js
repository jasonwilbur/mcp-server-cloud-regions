#!/usr/bin/env node

/**
 * Export all region data to a single JSON file for remote hosting
 */

import { writeFileSync } from 'fs';
import { allRegions } from '../dist/data/index.js';
import { providers } from '../dist/data/providers.js';
import { dataMetadata } from '../dist/data/metadata.js';

const exportData = {
  metadata: {
    ...dataMetadata,
    exportedAt: new Date().toISOString(),
  },
  providers,
  regions: allRegions,
};

const outputPath = './data/regions.json';
writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

console.log(`Exported ${allRegions.length} regions to ${outputPath}`);
console.log(`File size: ${(JSON.stringify(exportData).length / 1024).toFixed(1)} KB`);
