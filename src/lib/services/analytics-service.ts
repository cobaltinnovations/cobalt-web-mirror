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

	getSessionId(): String {
		return (window as any).cobaltAnalytics.getSessionId();
	},

	getSessionIdQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getSessionIdQueryParameterName();
	},

	getReferringMessageId(): String | undefined {
		return (window as any).cobaltAnalytics.getReferringMessageId();
	},

	getReferringMessageIdQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getReferringMessageIdQueryParameterName();
	},

	getReferringCampaignId(): String | undefined {
		return (window as any).cobaltAnalytics.getReferringCampaignId();
	},

	getReferringCampaignIdQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getReferringCampaignIdQueryParameterName();
	},
};
