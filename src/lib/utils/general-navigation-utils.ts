import {
	AdditionalNavigationItem,
	FeatureId,
	Institution,
	InstitutionFeature,
	InstitutionLocation,
} from '@/lib/models/institution';
import { AnalyticsNativeEventClickthroughFeatureSource, AnalyticsNativeEventTypeId } from '@/lib/models/analytics';
import { AnalyticsNativeEventClickthroughTopicCenterSource } from '@/lib/models/analytics';
import { SITE_LOCATION_ID } from '@/lib/models';
import { buildQueryParamUrl } from './url-utils';
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

export const getEmployerNavigationLinks = (locations: InstitutionLocation[]) =>
	locations.map((location) => ({
		title: location.shortName || location.name,
		to: buildQueryParamUrl('/providers', { institutionLocationId: location.institutionLocationId }),
	}));

export const getResourceNavigationMetadata = ({ featureId, name, navDescription, urlName }: InstitutionFeature) => ({
	title: featureId === FeatureId.SELF_HELP_RESOURCES ? 'Resource Library' : name,
	description: navDescription,
	to: urlName,
});

export const featuredTopicsNavigationMetadata = {
	title: 'Featured Topics',
	description: 'Pages that bring together a variety of resources focused on specific topics.',
	to: '/featured-topics',
};

export const communityDirectoryNavigationMetadata = { title: 'All communities', to: '/communities' };

export const getCommunityNavigationLink = (item: AdditionalNavigationItem, preferLegacyTopicCenters: boolean) => ({
	title: item.name,
	to: item.url,
	descriptionHtml: item.shortDescription,
	onClick: () => {
		if (preferLegacyTopicCenters) {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER, {
				topicCenterId: item.topicCenterId,
				source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV,
			});
		} else {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE, {
				pageId: item.pageId,
				source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV,
				siteLocationId: SITE_LOCATION_ID.COMMUNITY,
			});
		}
	},
});
