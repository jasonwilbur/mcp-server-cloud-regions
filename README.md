# mcp-server-cloud-regions

A Model Context Protocol (MCP) server providing comprehensive cloud region data across all major cloud providers.

## Features

- **Comprehensive Coverage**: Data for 13+ cloud providers including AWS, Azure, GCP, OCI, DigitalOcean, Crusoe, CoreWeave, Lambda Labs, Hetzner, Scaleway, Vultr, Linode, and OVH
- **Rich Data Model**: Location coordinates, availability zones, compliance certifications, sustainability metrics, GPU availability, and more
- **Powerful Filtering**: Filter by provider, tier, country, continent, compliance, sustainability, GPU availability
- **Geospatial Search**: Find regions nearest to any geographic location
- **Multi-Cloud Planning**: Compare provider coverage across regions

## Installation

```bash
npm install mcp-server-cloud-regions
```

Or run directly with npx:

```bash
npx mcp-server-cloud-regions
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### list_regions

List all cloud regions with optional filtering.

```json
{
  "providers": ["aws", "azure"],
  "continents": ["europe"],
  "compliance": ["GDPR", "ISO27001"],
  "carbonNeutral": true,
  "hasGpu": true
}
```

### get_region

Get detailed information about a specific region.

```json
{
  "id": "aws-us-east-1"
}
```

### list_providers

List all cloud providers with metadata.

```json
{
  "tier": "hyperscaler"
}
```

### find_nearby_regions

Find regions nearest to a geographic location.

```json
{
  "latitude": 40.7128,
  "longitude": -74.006,
  "maxDistanceKm": 500,
  "limit": 10,
  "hasGpu": true
}
```

### search_regions

Search regions by text query.

```json
{
  "query": "frankfurt"
}
```

### find_compliant_regions

Find regions with specific compliance certifications.

```json
{
  "certifications": ["HIPAA", "SOC2"],
  "countryCodes": ["US"]
}
```

### find_sustainable_regions

Find carbon neutral regions.

```json
{
  "providers": ["gcp", "azure"],
  "continents": ["europe"]
}
```

### find_gpu_regions

Find regions with GPU availability.

```json
{
  "gpuType": "H100",
  "providers": ["aws", "gcp"]
}
```

### compare_provider_coverage

Compare provider presence in a region.

```json
{
  "countryCode": "DE"
}
```

### list_countries

List all countries with cloud regions.

### list_cities

List all cities with cloud regions and which providers are present.

### get_statistics

Get summary statistics about all regions.

## Data Model

### CloudRegion

```typescript
interface CloudRegion {
  id: string;                    // Unique ID: provider-regionCode
  provider: CloudProvider;        // aws, azure, gcp, etc.
  regionCode: string;            // Provider's region code
  displayName: string;           // Human-readable name
  location: {
    country: string;
    countryCode: string;         // ISO 3166-1 alpha-2
    city: string;
    latitude: number;
    longitude: number;
    continent: string;
  };
  availabilityZones?: number;
  launchedDate?: string;
  status: 'ga' | 'preview' | 'limited' | 'deprecated';
  compliance?: ComplianceCertification[];
  sustainability?: {
    renewableEnergyPercent?: number;
    carbonNeutral?: boolean;
    pueRating?: number;
  };
  network?: {
    directConnect?: boolean;
    directConnectName?: string;
  };
  services?: {
    compute?: boolean;
    kubernetes?: boolean;
    serverless?: boolean;
    gpu?: boolean;
    gpuTypes?: string[];
    aiMl?: boolean;
  };
  governmentCloud?: boolean;
}
```

### Supported Providers

| Tier | Providers |
|------|-----------|
| Hyperscaler | AWS, Azure, GCP, OCI |
| Major | DigitalOcean, Linode, Vultr |
| Specialized | Crusoe, CoreWeave, Lambda Labs |
| Regional | OVH, Hetzner, Scaleway |

## Use Cases

- **Multi-cloud strategy**: Find which providers have presence in specific countries
- **Compliance planning**: Identify regions meeting regulatory requirements (HIPAA, GDPR, FedRAMP)
- **Latency optimization**: Find the nearest regions to your users
- **Sustainability**: Identify carbon-neutral data centers
- **GPU/AI workloads**: Find regions with specific GPU availability

## Contributing

Contributions are welcome! Please feel free to submit pull requests to add new providers, update region data, or improve functionality.

### Adding a New Provider

1. Add provider info to `src/data/providers.ts`
2. Create region data in `src/data/regions-*.ts`
3. Export from `src/data/index.ts`
4. Update types if needed

## License

MIT
