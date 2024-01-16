export interface iConfig {
	apiBaseUrl: string;
	providerManagementFeature: boolean;
	downForMaintenance: boolean;
	gaTrackingId: string;
	ga4MeasurementId: string;
	mixPanelId: string;
	showDebug: boolean;
	localhostSubdomain?: string;
	authRedirectUrls: [];
	storageKeys: Record<string, any>;
}
