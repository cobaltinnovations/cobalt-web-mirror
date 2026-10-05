import { FeatureId, Institution } from '@/lib/models/institution';
import { AnalyticsNativeEventClickthroughFeatureSource, AnalyticsNativeEventTypeId } from '@/lib/models/analytics';
import { analyticsService } from '@/lib/services/analytics-service';

export const getFeatureNavigationLink = ({ featureId, urlName }: { featureId: FeatureId; urlName: string }) => ({
	to: urlName,
	onClick: () => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_FEATURE, {
			featureId,
			source: AnalyticsNativeEventClickthroughFeatureSource.NAV,
		});
	},
});

export const getGeneralNavigationGroups = ({
	features,
	additionalNavigationItems,
}: Pick<Institution, 'features' | 'additionalNavigationItems'>) => ({
	appointments: features.filter(
		(feature) =>
			feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT' &&
			feature.navVisible &&
			feature.featureId !== FeatureId.GROUP_SESSIONS
	),
	groupSessions: features.find((feature) => feature.featureId === FeatureId.GROUP_SESSIONS && feature.navVisible),
	resources: features.filter(
		(feature) =>
			feature.navigationHeaderId === 'BROWSE_RESOURCES' &&
			feature.navVisible &&
			feature.featureId !== FeatureId.GROUP_SESSIONS
	),
	communities: additionalNavigationItems,
});
