import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AccountSource,
	Institution,
	InstitutionLocation,
	InstitutionResource,
	InstitutionResourceGroup,
} from '@/lib/models/institution';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';
import { InstitutionBlurb, INSTITUTION_BLURB_TYPE_ID } from '@/lib/models';

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
		return httpSingleton.orchestrateRequest<{ authenticationUrl: string }>({
			method: 'GET',
			url: `/institutions/${institutionId}/mychart-authentication-url`,
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
};
