import { AdditionalNavigationItem, FeatureId, InstitutionFeature } from '@/lib/models/institution';
import {
	getFeatureNavigationLink,
	getGeneralNavigationGroups,
	getEmployerNavigationLinks,
	getResourceNavigationMetadata,
	featuredTopicsNavigationMetadata,
	communityDirectoryNavigationMetadata,
	getCommunityNavigationLink,
} from './general-navigation-utils';
import { analyticsService } from '@/lib/services/analytics-service';
import {
	AnalyticsNativeEventClickthroughFeatureSource,
	AnalyticsNativeEventClickthroughTopicCenterSource,
	AnalyticsNativeEventTypeId,
} from '@/lib/models/analytics';

import { PAGE_LOCATION_ID, SITE_LOCATION_ID } from '@/lib/models';

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

it('preserves employer order, uses short names when available, and navigates with a directory-only filter', () => {
	const locations = [
		{ institutionId: 'COBALT', institutionLocationId: 'employer-b', name: 'Employer B long name', shortName: 'B' },
		{ institutionId: 'COBALT', institutionLocationId: 'employer-a', name: 'Employer A' },
	];
	const links = getEmployerNavigationLinks(locations);
	expect(links.map(({ title }) => title)).toEqual(['B', 'Employer A']);
	links.forEach(({ to }, index) => {
		const url = new URL(to, 'https://example.com');
		expect(url.pathname).toBe('/providers');
		expect([...url.searchParams]).toEqual([['institutionLocationId', locations[index].institutionLocationId]]);
	});
	expect(getEmployerNavigationLinks([])).toEqual([]);
});

it('uses the mockup resource labels while retaining institution routes and descriptions', () => {
	const resource = {
		...feature(FeatureId.SELF_HELP_RESOURCES, 'BROWSE_RESOURCES'),
		urlName: '/resources?org=example',
		navDescription: 'Configured description',
	};
	expect(getResourceNavigationMetadata(resource)).toEqual({
		title: 'Resource Library',
		to: resource.urlName,
		description: resource.navDescription,
	});
	const other = feature(FeatureId.COACHING, 'BROWSE_RESOURCES');
	expect(getResourceNavigationMetadata(other).title).toBe(other.name);
	expect(featuredTopicsNavigationMetadata).toEqual({
		title: 'Featured Topics',
		to: '/featured-topics',
		description: 'Pages that bring together a variety of resources focused on specific topics.',
		onClick: expect.any(Function),
	});
	expect(communityDirectoryNavigationMetadata).toEqual({
		title: 'All communities',
		to: '/communities',
		onClick: expect.any(Function),
	});
});

it.each([
	[featuredTopicsNavigationMetadata, PAGE_LOCATION_ID.FEATURED_TOPIC],
	[communityDirectoryNavigationMetadata, PAGE_LOCATION_ID.COMMUNITY],
])('records the directory destination for %s navigation', (metadata, pageLocationId) => {
	const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
	metadata.onClick();
	expect(persistEvent).toHaveBeenCalledTimes(1);
	expect(persistEvent).toHaveBeenCalledWith(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_DIRECTORY, {
		source: 'NAV',
		pageLocationId,
	});
});

it.each([false, true])(
	'retains community supporting HTML, destinations, and native analytics (legacy=%s)',
	(legacy) => {
		const item: AdditionalNavigationItem = {
			name: 'Configured community',
			url: legacy ? '/topic-centers/community' : '/pages/community',
			pageId: 'page-id',
			topicCenterId: 'topic-id',
			shortDescription: '<p>Supporting text</p>',
		};
		const persistEvent = jest.spyOn(analyticsService, 'persistEvent').mockReturnValue(true);
		const link = getCommunityNavigationLink(item, legacy);
		expect(link).toMatchObject({ title: item.name, to: item.url, descriptionHtml: item.shortDescription });
		link.onClick();
		expect(persistEvent).toHaveBeenCalledTimes(1);
		expect(persistEvent).toHaveBeenCalledWith(
			legacy
				? AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER
				: AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE,
			legacy
				? { topicCenterId: item.topicCenterId, source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV }
				: {
						pageId: item.pageId,
						source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV,
						siteLocationId: SITE_LOCATION_ID.COMMUNITY,
				  }
		);
		expect(
			getCommunityNavigationLink({ ...item, shortDescription: undefined }, legacy).descriptionHtml
		).toBeUndefined();
	}
);
