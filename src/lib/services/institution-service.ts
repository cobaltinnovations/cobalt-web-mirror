import { httpSingleton } from '@/lib/singletons/http-singleton';
import { AccountSource, Institution, InstitutionLocation } from '@/lib/models/institution';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';
import { InstitutionBlurb, INSTITUTION_BLURB_TYPE_ID } from '@/lib/models';
import { createQueryFn } from '../http-client';

interface GetAccountSourcesResponse {
	accountSources: AccountSource[];
}

interface GetAccountSourcesRequestBody {
	subdomain?: string;
	accountSourceId: string | null;
}

interface GetInstitutionResponse {
	accountSources: AccountSource[];
	institution: Institution;
}

export const institutionService = {
	getAccountSources(queryOptions?: GetAccountSourcesRequestBody) {
		return httpSingleton.orchestrateRequest<GetAccountSourcesResponse>({
			method: 'get',
			url: buildQueryParamUrl('/institution/account-sources', queryOptions),
		});
	},
	getInstitution(queryOptions?: GetAccountSourcesRequestBody) {
		return {
			queryKey: ['institution', queryOptions?.subdomain, queryOptions?.accountSourceId],
			queryFn: createQueryFn(() =>
				httpSingleton.orchestrateRequest<GetInstitutionResponse>({
					method: 'get',
					url: buildQueryParamUrl('/institution', queryOptions),
				})
			),
			staleTime: 1000 * 60 * 10, // 10 minutes in milliseconds
		};
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
};
