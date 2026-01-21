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
  | 'paperspace'
  // Regional providers
  | 'ovh'
  | 'hetzner'
  | 'scaleway';

/**
 * Provider tier classification
 */
export type ProviderTier = 'hyperscaler' | 'major' | 'specialized' | 'regional';

/**
 * Region type classification
 */
export type RegionType =
  | 'commercial'    // Standard public cloud regions
  | 'government'    // Government-restricted (GovCloud, IL4+, etc.)
  | 'sovereign'     // Data sovereignty / separate control plane (EU Sovereign, etc.)
  | 'china'         // China regions (separate operators/partitions)
  | 'multicloud';   // Cross-cloud offerings (OCI Database@Azure, etc.)

/**
 * Government classification levels (US-centric but extensible)
 */
export type GovernmentClassification =
  | 'IL2'           // Controlled Unclassified Information
  | 'IL4'           // Controlled Unclassified + NOFORN
  | 'IL5'           // Controlled Unclassified + National Security
  | 'IL6'           // Secret
  | 'Secret'        // Generic secret classification
  | 'TopSecret'     // Top Secret
  | 'Unclassified'; // Public sector, not classified

/**
 * Sovereignty and operational details for non-commercial regions
 */
export interface SovereigntyInfo {
  /** Operating entity if different from provider (e.g., "21Vianet" for Azure China) */
  operator?: string;
  /** Data residency guarantee (e.g., "EU", "Germany", "UK") */
  dataResidency?: string;
  /** Whether data is guaranteed to stay within jurisdiction */
  dataResidencyGuarantee?: boolean;
  /** Government classification level if applicable */
  governmentClassification?: GovernmentClassification;
  /** Required clearance or access restrictions */
  accessRestrictions?: string;
  /** Certification/approval body */
  certificationBody?: string;
  /** Host provider for multicloud regions */
  hostProvider?: CloudProvider;
  /** Additional sovereignty notes */
  notes?: string;
}

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
  | 'IRAP-PROTECTED'
  | 'MTCS'
  | 'ENS'
  | 'ISMAP'
  | 'DoD-IL5';

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
  /** Region type classification */
  regionType: RegionType;
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
  /** Sovereignty/operational details for gov/sovereign/china/multicloud regions */
  sovereignty?: SovereigntyInfo;
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
  /** Filter by region type(s) */
  regionTypes?: RegionType[];
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
  /** Minimum number of availability zones */
  minAvailabilityZones?: number;
  /** Filter by data residency */
  dataResidency?: string;
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
