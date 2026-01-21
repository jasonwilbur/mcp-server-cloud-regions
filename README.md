# mcp-server-cloud-regions

A [Model Context Protocol](https://modelcontextprotocol.io) server that provides comprehensive cloud region data across all major providers. Query, filter, and compare cloud infrastructure locations worldwide.

## Why This Exists

When planning multi-cloud deployments, you need answers to questions like:

- *"Which providers have regions in Germany with GDPR compliance?"*
- *"What's the nearest GPU-enabled region to my users in São Paulo?"*
- *"Which cloud has the most coverage in Asia Pacific?"*
- *"Where can I deploy with carbon-neutral infrastructure?"*

This MCP server provides a unified data model across **13 cloud providers** and **150+ regions** to answer these questions instantly.

## Supported Providers

| Tier | Providers |
|------|-----------|
| **Hyperscalers** | AWS, Azure, GCP, Oracle Cloud |
| **Major** | DigitalOcean, Linode (Akamai), Vultr |
| **Specialized** | Crusoe (clean energy), CoreWeave (GPU), Lambda Labs (AI/ML) |
| **Regional** | OVHcloud, Hetzner, Scaleway |

## Installation

```bash
npm install mcp-server-cloud-regions
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

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

## Available Tools

### Discovery

| Tool | Description |
|------|-------------|
| `list_regions` | List all regions with filtering (provider, country, compliance, GPU, sustainability) |
| `get_region` | Get detailed info for a specific region by ID |
| `list_providers` | List all cloud providers with metadata |
| `get_provider_regions` | Get all regions for a specific provider |
| `search_regions` | Full-text search across region names, cities, and countries |

### Geospatial

| Tool | Description |
|------|-------------|
| `find_nearby_regions` | Find regions nearest to coordinates (for latency optimization) |
| `list_countries` | All countries with cloud presence and region counts |
| `list_cities` | All cities with data centers and which providers operate there |

### Specialized Queries

| Tool | Description |
|------|-------------|
| `find_compliant_regions` | Filter by certifications (HIPAA, GDPR, FedRAMP, SOC2, etc.) |
| `find_sustainable_regions` | Find carbon-neutral data centers |
| `find_gpu_regions` | Find regions with GPU availability (A100, H100, TPU) |
| `compare_provider_coverage` | Compare provider presence in a country or continent |

### Analytics

| Tool | Description |
|------|-------------|
| `get_statistics` | Summary stats: totals by provider, country, continent, capabilities |

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

**Compare European coverage across hyperscalers:**
```json
{
  "tool": "compare_provider_coverage",
  "continent": "europe"
}
```

**Find carbon-neutral regions with H100 GPUs:**
```json
{
  "tool": "find_gpu_regions",
  "gpuType": "H100",
  "carbonNeutral": true
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
  }
}
```

## Use Cases

- **Multi-cloud strategy** — Identify providers with presence in your target markets
- **Compliance planning** — Find regions meeting regulatory requirements
- **Latency optimization** — Locate the nearest regions to your users
- **Sustainability goals** — Deploy on carbon-neutral infrastructure
- **GPU/AI workloads** — Find regions with specific accelerator availability
- **Disaster recovery** — Plan geographically distributed deployments

## Contributing

Contributions welcome! To add or update provider data:

1. Provider metadata: `src/data/providers.ts`
2. Region data: `src/data/regions-*.ts`
3. Run `npm run build` to verify

## License

MIT
