# mcp-server-cloud-regions

[![npm version](https://img.shields.io/npm/v/mcp-server-cloud-regions.svg)](https://www.npmjs.com/package/mcp-server-cloud-regions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server providing comprehensive cloud region data across all major providers. Query, filter, and compare cloud infrastructure locations worldwide.

**267 regions** across **14 cloud providers** — updated automatically.

## Quick Start

### With Claude Desktop

Add to your config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cloud-regions": {
      "command": "npx",
      "args": ["mcp-server-cloud-regions"]
    }
  }
}
```

### With Claude Code (CLI)

```bash
claude mcp add cloud-regions -- npx mcp-server-cloud-regions
```

Then ask Claude questions like:
- *"Which AWS regions have H100 GPUs?"*
- *"Find HIPAA-compliant regions in Europe"*
- *"What's the nearest cloud region to Tokyo with GPU support?"*
- *"Compare cloud provider coverage in Germany"*

## Why This Exists

Planning multi-cloud deployments requires answering questions across providers:

- *"Which providers have regions in Germany with GDPR compliance?"*
- *"What's the nearest GPU-enabled region to my users in São Paulo?"*
- *"Which cloud has the most coverage in Asia Pacific?"*
- *"Where can I deploy with carbon-neutral infrastructure?"*
- *"Which regions support FedRAMP for government workloads?"*

This MCP server provides a unified data model to answer these questions instantly.

## Supported Providers

| Tier | Providers |
|------|-----------|
| **Hyperscalers** | AWS, Azure, GCP, Oracle Cloud (OCI) |
| **Major** | DigitalOcean, Linode (Akamai), Vultr |
| **Specialized** | Crusoe (clean energy), CoreWeave (GPU), Lambda Labs (AI/ML), Paperspace (GPU/ML) |
| **Regional** | OVHcloud, Hetzner, Scaleway |

## Available Tools

### Discovery

| Tool | Description |
|------|-------------|
| `list_regions` | List all regions with filtering (provider, country, compliance, GPU, sustainability, region type) |
| `get_region` | Get detailed info for a specific region by ID (e.g., `aws-us-east-1`) |
| `list_providers` | List all cloud providers with metadata and tier classification |
| `get_provider_regions` | Get all regions for a specific provider |
| `search_regions` | Full-text search across region names, cities, countries, and provider names |

### Geospatial

| Tool | Description |
|------|-------------|
| `find_nearby_regions` | Find regions nearest to coordinates (for latency optimization) |
| `list_countries` | All countries with cloud presence and region counts |
| `list_cities` | All cities with data centers and which providers operate there |

### Specialized Queries

| Tool | Description |
|------|-------------|
| `find_compliant_regions` | Filter by certifications (HIPAA, GDPR, FedRAMP, SOC2, PCI-DSS, etc.) |
| `find_sustainable_regions` | Find carbon-neutral data centers |
| `find_gpu_regions` | Find regions with GPU availability (A100, H100, TPU, etc.) |
| `compare_provider_coverage` | Compare provider presence in a country or continent |

### Analytics & Metadata

| Tool | Description |
|------|-------------|
| `get_statistics` | Summary stats: totals by provider, country, continent, capabilities |
| `get_data_info` | Data freshness: last updated date, version, source URLs for each provider |

## Region Types

The server tracks different types of cloud regions:

| Type | Description | Examples |
|------|-------------|----------|
| `commercial` | Standard public cloud regions | aws-us-east-1, azure-eastus |
| `government` | Government-restricted regions (GovCloud, IL4+) | aws-us-gov-west-1, azure-usgovvirginia |
| `sovereign` | Data sovereignty regions with separate control planes | azure-germanynorth, oci-eu-frankfurt-2 |
| `china` | China regions (separate operators/partitions) | azure-chinaeast, aws-cn-north-1 |

Filter by region type using `list_regions` with the `regionTypes` parameter.

## Example Queries

**Find HIPAA-compliant regions in the US:**
```json
{
  "tool": "find_compliant_regions",
  "certifications": ["HIPAA"],
  "countryCodes": ["US"]
}
```

**Find the 5 nearest GPU regions to London:**
```json
{
  "tool": "find_nearby_regions",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "limit": 5,
  "hasGpu": true
}
```

**List regions with 3+ availability zones:**
```json
{
  "tool": "list_regions",
  "minAvailabilityZones": 3
}
```

**Compare European coverage across hyperscalers:**
```json
{
  "tool": "compare_provider_coverage",
  "continent": "europe"
}
```

**Find government regions:**
```json
{
  "tool": "list_regions",
  "regionTypes": ["government", "sovereign"]
}
```

**Check when data was last updated:**
```json
{
  "tool": "get_data_info"
}
```

## Data Model

Each region includes:

```typescript
{
  id: "aws-us-east-1",
  provider: "aws",
  regionCode: "us-east-1",
  displayName: "US East (N. Virginia)",
  regionType: "commercial",
  location: {
    country: "United States",
    countryCode: "US",
    city: "Ashburn",
    latitude: 39.0438,
    longitude: -77.4874,
    continent: "north-america"
  },
  availabilityZones: 6,
  launchedDate: "2006-08-25",
  status: "ga",
  compliance: ["SOC1", "SOC2", "HIPAA", "FedRAMP-Moderate", "PCI-DSS"],
  sustainability: {
    renewableEnergyPercent: 100,
    carbonNeutral: true
  },
  services: {
    compute: true,
    kubernetes: true,
    gpu: true,
    gpuTypes: ["NVIDIA A10G", "NVIDIA A100", "NVIDIA H100"]
  },
  sovereignty: {
    dataResidency: "US",
    dataResidencyGuarantee: true
  }
}
```

## Data Updates

The server automatically fetches the latest region data from GitHub on startup, with fallback to bundled data if offline. Data is verified against official provider documentation:

- [AWS Regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [Azure Regions](https://learn.microsoft.com/en-us/azure/reliability/regions-list)
- [GCP Regions](https://cloud.google.com/about/locations)
- [OCI Regions](https://oracle.com/cloud/public-cloud-regions/)
- [DigitalOcean Datacenters](https://docs.digitalocean.com/platform/regional-availability/)

A weekly GitHub Action checks for provider page changes and creates issues when updates may be needed.

## Use Cases

- **Multi-cloud strategy** — Identify providers with presence in your target markets
- **Compliance planning** — Find regions meeting regulatory requirements (HIPAA, GDPR, FedRAMP)
- **Latency optimization** — Locate the nearest regions to your users
- **Sustainability goals** — Deploy on carbon-neutral infrastructure
- **GPU/AI workloads** — Find regions with specific accelerator availability
- **Disaster recovery** — Plan geographically distributed deployments
- **Government workloads** — Find GovCloud and sovereign regions

## Installation

```bash
npm install mcp-server-cloud-regions
```

Or run directly with npx:

```bash
npx mcp-server-cloud-regions
```

## Contributing

Contributions welcome! To add or update provider data:

1. Edit provider metadata: `src/data/providers.ts`
2. Edit region data: `src/data/regions-*.ts`
3. Update metadata date: `src/data/metadata.ts`
4. Run `npm run build && npm run export-data`
5. Submit a pull request

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run export-data` | Export regions to `data/regions.json` |
| `npm run check-updates` | Check if provider pages have changed |

## Disclaimer

This data is provided for informational purposes only. Cloud providers frequently add, modify, or deprecate regions and services. **Users are responsible for verifying region availability, compliance certifications, and service offerings directly with each cloud provider before making deployment decisions.**

While we strive to keep this data accurate and up-to-date, we make no guarantees about completeness or correctness. Always consult official provider documentation for production planning.

## License

MIT
