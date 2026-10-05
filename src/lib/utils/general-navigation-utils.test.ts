import { AdditionalNavigationItem, FeatureId, InstitutionFeature } from '@/lib/models/institution';
import { getFeatureNavigationLink, getGeneralNavigationGroups } from './general-navigation-utils';
import { analyticsService } from '@/lib/services/analytics-service';
import { AnalyticsNativeEventClickthroughFeatureSource, AnalyticsNativeEventTypeId } from '@/lib/models/analytics';

afterEach(() => jest.restoreAllMocks());

const feature = (featureId: FeatureId, navigationHeaderId: string, navVisible = true): InstitutionFeature => ({
	featureId,
	navigationHeaderId,
	navVisible,
	name: featureId,
	description: '',
	navDescription: '',
	landingPageVisible: true,
	recommended: false,
	supportRoleIds: [],
	urlName: `/${featureId.toLowerCase()}`,
	locationPromptRequired: false,
});

it('lifts Group Sessions out of the resource dropdown while retaining appointment and resource contracts', () => {
	const therapy = feature(FeatureId.THERAPY, 'CONNECT_WITH_SUPPORT');
	const groupSessions = feature(FeatureId.GROUP_SESSIONS, 'BROWSE_RESOURCES');
	const resources = feature(FeatureId.SELF_HELP_RESOURCES, 'BROWSE_RESOURCES');
	const groups = getGeneralNavigationGroups({
		features: [therapy, groupSessions, resources],
		additionalNavigationItems: [],
	});
	expect(groups.appointments).toEqual([therapy]);
	expect(groups.groupSessions).toBe(groupSessions);
	expect(groups.resources).toEqual([resources]);
});

it('honors feature visibility for every group', () => {
	const groups = getGeneralNavigationGroups({
		features: [
			feature(FeatureId.THERAPY, 'CONNECT_WITH_SUPPORT', false),
			feature(FeatureId.GROUP_SESSIONS, 'BROWSE_RESOURCES', false),
			feature(FeatureId.SELF_HELP_RESOURCES, 'BROWSE_RESOURCES', false),
		],
		additionalNavigationItems: [],
	});
	expect(groups).toEqual({ appointments: [], groupSessions: undefined, resources: [], communities: [] });
});

it('preserves only the org-supplied community links in their curated order', () => {
	const communities: AdditionalNavigationItem[] = [
		{ name: 'Parents', url: '/pages/parents', pageId: 'parent-page' },
		{ name: 'Spaces of Color', url: '/pages/spaces-of-color', pageId: 'spaces-page' },
	];
	expect(getGeneralNavigationGroups({ features: [], additionalNavigationItems: communities }).communities).toEqual(
		communities
	);
});

it('retains the configured screening URL and native feature analytics when Group Sessions moves to a direct link', () => {
	const groupSessions = {
		...feature(FeatureId.GROUP_SESSIONS, 'CONNECT_WITH_SUPPORT'),
		urlName: '/screening/group-sessions?screeningFlowId=org-screening',
	};
	const groups = getGeneralNavigationGroups({ features: [groupSessions], additionalNavigationItems: [] });
	const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
	const link = getFeatureNavigationLink(groups.groupSessions!);
	expect(link.to).toBe(groupSessions.urlName);
	link.onClick();
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(AnalyticsNativeEventTypeId.CLICKTHROUGH_FEATURE, {
		featureId: FeatureId.GROUP_SESSIONS,
		source: AnalyticsNativeEventClickthroughFeatureSource.NAV,
	});
});
