import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AccountSource,
	Institution,
	InstitutionLocation,
	InstitutionResource,
	InstitutionResourceGroup,
} from '@/lib/models/institution';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';
import { InstitutionBlurb, INSTITUTION_BLURB_TYPE_ID, CourseVideoModel } from '@/lib/models';
import { analyticsService } from '@/lib/services';

interface GetAccountSourcesResponse {
	accountSources: AccountSource[];
}

interface GetAccountSourcesRequestBody {
	subdomain?: string;
	accountSourceId: string | null;
}

export interface GetInstitutionResponse {
	accountSources: AccountSource[];
	institution: Institution;
}

export interface GetInstitutionResourceGroupsResponse {
	institutionResourceGroupsTitle: string;
	institutionResourceGroupsDescription: string;
	institutionResourceGroups: InstitutionResourceGroup[];
}

export interface GetInstitutionResourceGroupDetailResponse {
	institutionResourceGroup: InstitutionResourceGroup;
}

export interface GetInstitutionResourcesResponse {
	institutionResources: InstitutionResource[];
}

export const institutionService = {
	getAccountSources(queryOptions?: GetAccountSourcesRequestBody) {
		return httpSingleton.orchestrateRequest<GetAccountSourcesResponse>({
			method: 'get',
			url: buildQueryParamUrl('/institution/account-sources', queryOptions),
		});
	},
	getInstitution(queryOptions?: GetAccountSourcesRequestBody) {
		return httpSingleton.orchestrateRequest<GetInstitutionResponse>({
			method: 'get',
			url: buildQueryParamUrl('/institution', queryOptions),
		});
	},
	getInstitutionBlurbs() {
		return httpSingleton.orchestrateRequest<{
			institutionBlurbsByInstitutionBlurbTypeId: Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>;
		}>({
			method: 'GET',
			url: '/institution-blurbs',
		});
	},
	getInstitutionLocations() {
		return httpSingleton.orchestrateRequest<{
			locations: InstitutionLocation[];
		}>({
			method: 'GET',
			url: '/institution/locations',
		});
	},
	dismissAlert(alertId: string) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: `/alerts/${alertId}/dismiss`,
		});
	},
	getMyChartAuthenticationUrl(institutionId: string) {
		// Construct a query string that preserves analytics information
		const analyticsFingerprint = analyticsService.getFingerprint();
		const analyticsSessionId = analyticsService.getSessionId();
		const analyticsReferringCampaign = analyticsService.getReferringCampaign();
		const analyticsReferringMessageId = analyticsService.getReferringMessageId();

		let redirectSearchComponents = [];

		redirectSearchComponents.push(
			`${analyticsService.getFingerprintQueryParameterName()}=${encodeURIComponent(analyticsFingerprint)}`
		);

		redirectSearchComponents.push(
			`${analyticsService.getSessionIdQueryParameterName()}=${encodeURIComponent(analyticsSessionId)}`
		);

		if (analyticsReferringCampaign)
			redirectSearchComponents.push(
				`${analyticsService.getReferringCampaignQueryParameterName()}=${encodeURIComponent(
					analyticsReferringCampaign
				)}`
			);

		if (analyticsReferringMessageId)
			redirectSearchComponents.push(
				`${analyticsService.getReferringMessageIdQueryParameterName()}=${encodeURIComponent(
					analyticsReferringMessageId
				)}`
			);

		return httpSingleton.orchestrateRequest<{ authenticationUrl: string }>({
			method: 'GET',
			url: `/institutions/${institutionId}/mychart-authentication-url?${redirectSearchComponents.join('&')}`,
		});
	},
	getResourceGroups() {
		return httpSingleton.orchestrateRequest<GetInstitutionResourceGroupsResponse>({
			method: 'GET',
			url: '/institution-resource-groups',
		});
	},
	getResourceGroupDetail(resourceGroupUrlNameOrId: string) {
		return httpSingleton.orchestrateRequest<GetInstitutionResourceGroupDetailResponse>({
			method: 'GET',
			url: '/institution-resource-groups/' + resourceGroupUrlNameOrId,
		});
	},
	getResourcesByGroup(resourceGroupUrlNameOrId: string) {
		return httpSingleton.orchestrateRequest<GetInstitutionResourcesResponse>({
			method: 'GET',
			url: '/institution-resources?institutionResourceGroupId=' + resourceGroupUrlNameOrId,
		});
	},
	getGoogleMapsApiKey(institutionId: string) {
		return httpSingleton.orchestrateRequest<{
			googleMapsPlatformApiKey: string;
		}>({
			method: 'GET',
			url: `/institutions/${institutionId}/google-maps-platform-api-key`,
		});
	},
	getVideo(videoId: string) {
		return httpSingleton.orchestrateRequest<{ video: CourseVideoModel }>({
			method: 'GET',
			url: `/videos/${videoId}`,
		});
	},
};
