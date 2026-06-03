# Changelog

All notable changes to mcp-server-cloud-regions will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-03

### Added
- **MCP tool annotations** (`readOnlyHint`, `idempotentHint`) on all 14 tools.
- **Structured output** (`structuredContent`) on every tool, stamped with the data's `lastUpdated` so callers can see freshness.
- **Test suite** (Vitest) covering region-data integrity (unique ids, valid country codes, coordinate ranges, known providers) and the geospatial/compliance tools.
- **GitHub Actions CI** (build + typecheck + lint + test on Node 20/22).
- A `limit` parameter on `list_regions`.
- Two new GA regions: GCP `asia-southeast3` (Bangkok) and OCI `ap-kulai-2` (Malaysia West / Kulai). Total regions 267 → 269.

### Changed
- Server version is now read from `package.json` (previously hardcoded and stale at `0.1.0` in the MCP handshake).
- `list_regions` with no filter now returns a compact summary instead of dumping all 267 region objects; pass a filter or `limit` for full objects.
- README "updated automatically" wording softened to accurately describe the weekly change-detector + curated-data refresh model.
- Minimum Node bumped to 20; `@modelcontextprotocol/sdk` bumped to ^1.18.

### Fixed
- `npm run lint` now works — added ESLint + typescript-eslint and a flat `eslint.config.js` (the `lint` script previously referenced an uninstalled binary with no config).
- Build is now hermetic (`types: ["node"]`) — fixes a `Cannot find type definition file for 'yauzl'` failure on clean installs.
- `compare_provider_coverage` now requires a `countryCode` or `continent` instead of silently comparing globally.
- Moved a stray bottom-of-file `GeoLocation` import to the top of `src/tools/index.ts`.
