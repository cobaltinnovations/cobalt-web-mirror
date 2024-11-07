import { AnalyticsNativeEventTypeId } from '@/lib/models';

export const analyticsService = {
	persistEvent(analyticsNativeEventTypeId: AnalyticsNativeEventTypeId, data: Record<string, any> = {}): boolean {
		// Delegate to object configured on the window.
		// See public/static/js/analytics.js for implementation and public/index.html for initialization.
		try {
			return (window as any).cobaltAnalytics.persistEvent(analyticsNativeEventTypeId, data);
		} catch (e) {
			console.warn('Unable to persist native analytics event', e);
			return false;
		}
	},

	getFingerprint(): string {
		return (window as any).cobaltAnalytics.getFingerprint();
	},

	getFingerprintQueryParameterName(): string {
		return (window as any).cobaltAnalytics.getFingerprintQueryParameterName();
	},

	getSessionId(): string {
		return (window as any).cobaltAnalytics.getSessionId();
	},

	getSessionIdQueryParameterName(): string {
		return (window as any).cobaltAnalytics.getSessionIdQueryParameterName();
	},

	getReferringMessageId(): string | undefined {
		return (window as any).cobaltAnalytics.getReferringMessageId();
	},

	getReferringMessageIdQueryParameterName(): string {
		return (window as any).cobaltAnalytics.getReferringMessageIdQueryParameterName();
	},

	getReferringCampaign(): string | undefined {
		return (window as any).cobaltAnalytics.getReferringCampaign();
	},

	getReferringCampaignQueryParameterName(): string {
		return (window as any).cobaltAnalytics.getReferringCampaignQueryParameterName();
	},
};
