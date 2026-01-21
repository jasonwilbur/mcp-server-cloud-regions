#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import type { RegionFilter, NearbySearch, ComplianceCertification, ProviderTier, CloudProvider } from './types/index.js';
import {
  listRegions,
  getRegion,
  listProviders,
  getProviderRegions,
  findNearbyRegions,
  searchRegions,
  getStatistics,
  findCompliantRegions,
  findSustainableRegions,
  findGpuRegions,
  compareProviderCoverage,
  listCountries,
  listCities,
} from './tools/index.js';

const server = new Server(
  {
    name: 'mcp-server-cloud-regions',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_regions',
        description: 'List all cloud regions across all providers. Supports filtering by provider, tier, country, continent, compliance, sustainability, GPU availability, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs (e.g., ["aws", "azure", "gcp"])',
            },
            tiers: {
              type: 'array',
              items: { type: 'string', enum: ['hyperscaler', 'major', 'specialized', 'regional'] },
              description: 'Filter by provider tier',
            },
            countryCodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by ISO country codes (e.g., ["US", "DE", "JP"])',
            },
            continents: {
              type: 'array',
              items: { type: 'string', enum: ['north-america', 'south-america', 'europe', 'asia', 'africa', 'oceania', 'middle-east'] },
              description: 'Filter by continent',
            },
            compliance: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by compliance certifications (e.g., ["HIPAA", "GDPR", "SOC2"])',
            },
            carbonNeutral: {
              type: 'boolean',
              description: 'Filter to only carbon neutral regions',
            },
            hasGpu: {
              type: 'boolean',
              description: 'Filter to only regions with GPU availability',
            },
            governmentCloud: {
              type: 'boolean',
              description: 'Filter to only government cloud regions',
            },
            minAvailabilityZones: {
              type: 'number',
              description: 'Filter by minimum number of availability zones',
            },
          },
        },
      },
      {
        name: 'get_region',
        description: 'Get detailed information about a specific cloud region by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Region ID (e.g., "aws-us-east-1", "azure-eastus", "gcp-us-central1")',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'list_providers',
        description: 'List all cloud providers with their metadata',
        inputSchema: {
          type: 'object',
          properties: {
            tier: {
              type: 'string',
              enum: ['hyperscaler', 'major', 'specialized', 'regional'],
              description: 'Filter by provider tier',
            },
          },
        },
      },
      {
        name: 'get_provider_regions',
        description: 'Get all regions for a specific cloud provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'Provider ID (e.g., "aws", "azure", "gcp", "oci", "digitalocean", "crusoe")',
            },
          },
          required: ['provider'],
        },
      },
      {
        name: 'find_nearby_regions',
        description: 'Find cloud regions nearest to a geographic location. Useful for latency optimization and data residency planning.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Target latitude',
            },
            longitude: {
              type: 'number',
              description: 'Target longitude',
            },
            maxDistanceKm: {
              type: 'number',
              description: 'Maximum distance in kilometers',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
            },
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs',
            },
            hasGpu: {
              type: 'boolean',
              description: 'Filter to only regions with GPU',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'search_regions',
        description: 'Search regions by text query. Searches display name, region code, city, country, and provider name.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query text',
            },
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_statistics',
        description: 'Get summary statistics about all cloud regions, including counts by provider, country, continent, and special capabilities.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'find_compliant_regions',
        description: 'Find regions that have specific compliance certifications (e.g., HIPAA, FedRAMP, GDPR, SOC2)',
        inputSchema: {
          type: 'object',
          properties: {
            certifications: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required compliance certifications. Regions must have ALL specified certifications.',
            },
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs',
            },
            countryCodes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by country codes',
            },
          },
          required: ['certifications'],
        },
      },
      {
        name: 'find_sustainable_regions',
        description: 'Find carbon neutral and sustainable cloud regions',
        inputSchema: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs',
            },
            continents: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by continent',
            },
          },
        },
      },
      {
        name: 'find_gpu_regions',
        description: 'Find regions with GPU availability, optionally filtering by GPU type (e.g., A100, H100, TPU)',
        inputSchema: {
          type: 'object',
          properties: {
            gpuType: {
              type: 'string',
              description: 'Filter by GPU type (e.g., "A100", "H100", "TPU")',
            },
            providers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by provider IDs',
            },
            continents: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by continent',
            },
          },
        },
      },
      {
        name: 'compare_provider_coverage',
        description: 'Compare how many regions each provider has in a specific country or continent',
        inputSchema: {
          type: 'object',
          properties: {
            countryCode: {
              type: 'string',
              description: 'ISO country code to compare (e.g., "US", "DE", "JP")',
            },
            continent: {
              type: 'string',
              description: 'Continent to compare (e.g., "europe", "asia")',
            },
          },
        },
      },
      {
        name: 'list_countries',
        description: 'List all countries that have cloud regions, with count of regions in each',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_cities',
        description: 'List all cities that have cloud regions, with the providers present in each',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_regions': {
        const filter: RegionFilter = {};
        if (args?.providers) filter.providers = args.providers as CloudProvider[];
        if (args?.tiers) filter.tiers = args.tiers as ProviderTier[];
        if (args?.countryCodes) filter.countryCodes = args.countryCodes as string[];
        if (args?.continents) filter.continents = args.continents as any[];
        if (args?.compliance) filter.compliance = args.compliance as ComplianceCertification[];
        if (args?.carbonNeutral !== undefined) filter.carbonNeutral = args.carbonNeutral as boolean;
        if (args?.hasGpu !== undefined) filter.hasGpu = args.hasGpu as boolean;
        if (args?.governmentCloud !== undefined) filter.governmentCloud = args.governmentCloud as boolean;
        if (args?.minAvailabilityZones !== undefined) filter.minAvailabilityZones = args.minAvailabilityZones as number;

        const regions = listRegions(Object.keys(filter).length > 0 ? filter : undefined);
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'get_region': {
        const region = getRegion(args?.id as string);
        if (!region) {
          return {
            content: [{ type: 'text', text: `Region not found: ${args?.id}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(region, null, 2) }],
        };
      }

      case 'list_providers': {
        const providerList = listProviders(args?.tier as ProviderTier | undefined);
        return {
          content: [{ type: 'text', text: JSON.stringify(providerList, null, 2) }],
        };
      }

      case 'get_provider_regions': {
        const regions = getProviderRegions(args?.provider as CloudProvider);
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'find_nearby_regions': {
        const search: NearbySearch = {
          latitude: args?.latitude as number,
          longitude: args?.longitude as number,
          maxDistanceKm: args?.maxDistanceKm as number | undefined,
          limit: args?.limit as number | undefined,
        };
        if (args?.providers || args?.hasGpu) {
          search.filter = {};
          if (args?.providers) search.filter.providers = args.providers as CloudProvider[];
          if (args?.hasGpu) search.filter.hasGpu = args.hasGpu as boolean;
        }
        const regions = findNearbyRegions(search);
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'search_regions': {
        const filter: RegionFilter | undefined = args?.providers
          ? { providers: args.providers as CloudProvider[] }
          : undefined;
        const regions = searchRegions(args?.query as string, filter);
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'get_statistics': {
        const stats = getStatistics();
        return {
          content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
        };
      }

      case 'find_compliant_regions': {
        const filter: RegionFilter = {};
        if (args?.providers) filter.providers = args.providers as CloudProvider[];
        if (args?.countryCodes) filter.countryCodes = args.countryCodes as string[];
        const regions = findCompliantRegions(
          args?.certifications as ComplianceCertification[],
          Object.keys(filter).length > 0 ? filter : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'find_sustainable_regions': {
        const filter: RegionFilter = {};
        if (args?.providers) filter.providers = args.providers as CloudProvider[];
        if (args?.continents) filter.continents = args.continents as any[];
        const regions = findSustainableRegions(Object.keys(filter).length > 0 ? filter : undefined);
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'find_gpu_regions': {
        const filter: RegionFilter = {};
        if (args?.providers) filter.providers = args.providers as CloudProvider[];
        if (args?.continents) filter.continents = args.continents as any[];
        const regions = findGpuRegions(
          args?.gpuType as string | undefined,
          Object.keys(filter).length > 0 ? filter : undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(regions, null, 2) }],
        };
      }

      case 'compare_provider_coverage': {
        const coverage = compareProviderCoverage(
          args?.countryCode as string | undefined,
          args?.continent as string | undefined
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(coverage, null, 2) }],
        };
      }

      case 'list_countries': {
        const countries = listCountries();
        return {
          content: [{ type: 'text', text: JSON.stringify(countries, null, 2) }],
        };
      }

      case 'list_cities': {
        const cities = listCities();
        return {
          content: [{ type: 'text', text: JSON.stringify(cities, null, 2) }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cloud Regions MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
