import { httpSingleton } from '@/lib/singletons/http-singleton';
import { AccountSource, Institution, InstitutionLocation } from '@/lib/models/institution';
import { encodeQueryData } from '@/lib/utils/url-utils';
import { InstitutionBlurb, INSTITUTION_BLURB_TYPE_ID } from '@/lib/models';

interface GetAccountSourcesResponse {
	accountSources: AccountSource[];
}

interface GetAccountSourcesRequestBody {
	subdomain?: string;
	accountSourceId?: string;
}

interface GetInstitutionResponse {
	accountSources: AccountSource[];
	institution: Institution;
}

export const institutionService = {
	getAccountSources(queryOptions?: GetAccountSourcesRequestBody) {
		let url = '/institution/account-sources';
		const queryParameterString = queryOptions ? encodeQueryData(queryOptions) : null;

		if (queryParameterString) {
			url = url.concat(`?${queryParameterString}`);
		}

		return httpSingleton.orchestrateRequest<GetAccountSourcesResponse>({
			method: 'get',
			url,
		});
	},
	getInstitution(queryOptions?: GetAccountSourcesRequestBody) {
		let url = '/institution';
		const queryParameterString = queryOptions ? encodeQueryData(queryOptions) : null;

		if (queryParameterString) {
			url = url.concat(`?${queryParameterString}`);
		}

		return httpSingleton.orchestrateRequest<GetInstitutionResponse>({
			method: 'get',
			url,
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
};
