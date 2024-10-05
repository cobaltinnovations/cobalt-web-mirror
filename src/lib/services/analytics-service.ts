import { AnalyticsNativeEventTypeId } from '@/lib/models';

export const analyticsService = {
	persistEvent(analyticsNativeEventTypeId: AnalyticsNativeEventTypeId, data: Record<string, any>) {
		// Delegate to object configured on the window.
		// See public/static/js/analytics.js for implementation and public/index.html for initialization.
		try {
			(window as any).cobaltAnalytics.persistEvent(analyticsNativeEventTypeId, data);
		} catch (e) {
			console.warn('Unable to persist native analytics event', e);
		}
	},
};
