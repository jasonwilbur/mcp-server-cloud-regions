#!/usr/bin/env node

/**
 * Check if cloud provider region pages have changed
 * This script fetches provider pages and compares content hashes
 * to detect when regions may have been added/removed.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const SOURCES = {
  aws: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
  azure: 'https://learn.microsoft.com/en-us/azure/reliability/regions-list',
  gcp: 'https://cloud.google.com/about/locations',
  oci: 'https://www.oracle.com/cloud/public-cloud-regions/',
  digitalocean: 'https://docs.digitalocean.com/platform/regional-availability/',
};

const HASH_FILE = './data/source-hashes.json';

async function fetchPageContent(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; mcp-cloud-regions-checker/1.0)',
        'Accept': 'text/html',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

function hashContent(content) {
  // Remove dynamic elements that change on every page load
  const cleaned = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return createHash('sha256').update(cleaned).digest('hex').substring(0, 16);
}

function loadPreviousHashes() {
  if (existsSync(HASH_FILE)) {
    try {
      return JSON.parse(readFileSync(HASH_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveHashes(hashes) {
  writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
}

async function main() {
  console.log('Checking cloud provider pages for changes...\n');

  const previousHashes = loadPreviousHashes();
  const currentHashes = {};
  const changes = [];

  for (const [provider, url] of Object.entries(SOURCES)) {
    process.stdout.write(`Checking ${provider}... `);

    const content = await fetchPageContent(url);
    if (!content) {
      console.log('FAILED');
      continue;
    }

    const hash = hashContent(content);
    currentHashes[provider] = { hash, checkedAt: new Date().toISOString(), url };

    if (previousHashes[provider]?.hash && previousHashes[provider].hash !== hash) {
      console.log(`CHANGED (was: ${previousHashes[provider].hash}, now: ${hash})`);
      changes.push({
        provider,
        url,
        previousHash: previousHashes[provider].hash,
        currentHash: hash,
        previousCheck: previousHashes[provider].checkedAt,
      });
    } else if (!previousHashes[provider]?.hash) {
      console.log(`NEW (hash: ${hash})`);
    } else {
      console.log('unchanged');
    }
  }

  saveHashes(currentHashes);

  console.log('\n---');

  if (changes.length > 0) {
    console.log(`\n⚠️  CHANGES DETECTED in ${changes.length} provider(s):\n`);
    for (const change of changes) {
      console.log(`  ${change.provider.toUpperCase()}`);
      console.log(`    URL: ${change.url}`);
      console.log(`    Previous check: ${change.previousCheck}`);
      console.log(`    Hash changed: ${change.previousHash} → ${change.currentHash}`);
      console.log('');
    }
    console.log('Please verify these sources and update region data if needed.');

    // Exit with code 1 to signal changes (useful for CI)
    process.exit(1);
  } else {
    console.log('\n✓ No changes detected in provider pages.');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(2);
});
