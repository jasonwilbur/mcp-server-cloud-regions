/**
 * Cloud provider identifiers
 */
export type CloudProvider =
  // Hyperscalers
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'oci'
  // Major providers
  | 'digitalocean'
  | 'linode'
  | 'vultr'
  // Specialized providers
  | 'crusoe'
  | 'coreweave'
  | 'lambda'
  // Regional providers
  | 'ovh'
  | 'hetzner'
  | 'scaleway';

/**
 * Provider tier classification
 */
export type ProviderTier = 'hyperscaler' | 'major' | 'specialized' | 'regional';

/**
 * Geographic location data
 */
export interface GeoLocation {
  /** Country name */
  country: string;
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** City or metropolitan area */
  city: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Continent */
  continent: 'north-america' | 'south-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'middle-east';
}

/**
 * Compliance and certification information
 */
export type ComplianceCertification =
  | 'SOC1'
  | 'SOC2'
  | 'SOC3'
  | 'ISO27001'
  | 'ISO27017'
  | 'ISO27018'
  | 'HIPAA'
  | 'HITRUST'
  | 'FedRAMP-High'
  | 'FedRAMP-Moderate'
  | 'PCI-DSS'
  | 'GDPR'
  | 'CCPA'
  | 'C5'
  | 'IRAP'
  | 'MTCS'
  | 'ENS'
  | 'ISMAP';

/**
 * Sustainability and environmental data
 */
export interface Sustainability {
  /** Percentage of renewable energy used (0-100) */
  renewableEnergyPercent?: number;
  /** Whether the region is carbon neutral */
  carbonNeutral?: boolean;
  /** Power Usage Effectiveness rating */
  pueRating?: number;
  /** Additional sustainability notes */
  notes?: string;
}

/**
 * Network connectivity options
 */
export interface NetworkConnectivity {
  /** Direct/dedicated connection available (e.g., AWS Direct Connect, Azure ExpressRoute) */
  directConnect?: boolean;
  /** Name of the direct connect service */
  directConnectName?: string;
  /** Available internet exchange points */
  internetExchanges?: string[];
  /** Cross-cloud interconnect availability */
  cloudInterconnect?: string[];
}

/**
 * Service availability in a region
 */
export interface ServiceAvailability {
  /** Compute services available */
  compute?: boolean;
  /** Kubernetes/container orchestration */
  kubernetes?: boolean;
  /** Serverless/functions */
  serverless?: boolean;
  /** Block storage */
  blockStorage?: boolean;
  /** Object storage */
  objectStorage?: boolean;
  /** Managed databases */
  databases?: boolean;
  /** GPU instances available */
  gpu?: boolean;
  /** GPU types available */
  gpuTypes?: string[];
  /** AI/ML services */
  aiMl?: boolean;
  /** Additional notable services */
  additionalServices?: string[];
}

/**
 * Cloud region definition
 */
export interface CloudRegion {
  /** Unique identifier: provider-regionCode (e.g., aws-us-east-1) */
  id: string;
  /** Cloud provider */
  provider: CloudProvider;
  /** Provider's region code (e.g., us-east-1, eastus, us-central1) */
  regionCode: string;
  /** Human-readable display name */
  displayName: string;
  /** Geographic location details */
  location: GeoLocation;
  /** Number of availability zones (if applicable) */
  availabilityZones?: number;
  /** Date the region launched */
  launchedDate?: string;
  /** Whether the region is generally available */
  status: 'ga' | 'preview' | 'limited' | 'deprecated';
  /** Compliance certifications */
  compliance?: ComplianceCertification[];
  /** Sustainability information */
  sustainability?: Sustainability;
  /** Network connectivity options */
  network?: NetworkConnectivity;
  /** Service availability */
  services?: ServiceAvailability;
  /** Whether this is a government/sovereign cloud region */
  governmentCloud?: boolean;
  /** Additional notes */
  notes?: string;
}

/**
 * Cloud provider metadata
 */
export interface CloudProviderInfo {
  /** Provider identifier */
  id: CloudProvider;
  /** Provider display name */
  name: string;
  /** Provider tier classification */
  tier: ProviderTier;
  /** Provider website */
  website: string;
  /** Provider's region documentation URL */
  regionDocsUrl?: string;
  /** Provider's status page URL */
  statusPageUrl?: string;
  /** Brief description */
  description: string;
  /** Provider specialization/focus */
  specialization?: string[];
}

/**
 * Search/filter criteria for regions
 */
export interface RegionFilter {
  /** Filter by provider(s) */
  providers?: CloudProvider[];
  /** Filter by provider tier(s) */
  tiers?: ProviderTier[];
  /** Filter by country code(s) */
  countryCodes?: string[];
  /** Filter by continent(s) */
  continents?: GeoLocation['continent'][];
  /** Filter by compliance certification(s) - regions must have ALL specified */
  compliance?: ComplianceCertification[];
  /** Filter to only carbon neutral regions */
  carbonNeutral?: boolean;
  /** Filter to only regions with GPU availability */
  hasGpu?: boolean;
  /** Filter by status */
  status?: CloudRegion['status'][];
  /** Filter to government cloud regions only */
  governmentCloud?: boolean;
  /** Minimum number of availability zones */
  minAvailabilityZones?: number;
}

/**
 * Nearby region search criteria
 */
export interface NearbySearch {
  /** Target latitude */
  latitude: number;
  /** Target longitude */
  longitude: number;
  /** Maximum distance in kilometers (default: no limit, returns all sorted by distance) */
  maxDistanceKm?: number;
  /** Maximum number of results */
  limit?: number;
  /** Additional filters to apply */
  filter?: RegionFilter;
}

/**
 * Region with distance information
 */
export interface RegionWithDistance extends CloudRegion {
  /** Distance from search point in kilometers */
  distanceKm: number;
}
