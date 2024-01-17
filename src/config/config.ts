import { iConfig } from '@/config/config-models';

const config: iConfig = {
	apiBaseUrl: 'http://localhost:8080/',
	providerManagementFeature: false,
	downForMaintenance: false,

	gaTrackingId: undefined,
	ga4MeasurementId: undefined,
	mixPanelId: undefined,

	showDebug: false,

	localhostSubdomain: undefined,

	authRedirectUrls: [],
	storageKeys: {
		mhicRecentOrdersStorageKey: 'xxx',
	},
};

export default config;
