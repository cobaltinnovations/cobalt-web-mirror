import { iConfig } from '@/config/config-models';

export const config: iConfig = {
	apiBaseUrl: 'http://localhost:8080/',
	providerManagementFeature: false,
	downForMaintenance: false,

	gaTrackingId: undefined,
	ga4MeasurementId: undefined,
	mixPanelId: undefined,

	showDebug: true,

	localhostSubdomain: undefined,

	authRedirectUrls: [],
	storageKeys: {
		mhicRecentOrdersStorageKey: 'mhicRecentOrders',
		chunkloadRefreshKey: 'ChunkLoadError-refresh',
	},
};

export default config;
