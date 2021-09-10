import { httpSingleton } from '@/lib/singletons/http-singleton';
import { AccountSource, Institution } from '@/lib/models/institution';
import { encodeQueryData } from '@/lib/utils/url-utils';

interface GetAccountSourcesResponse {
	accountSources: AccountSource[];
}

interface GetAccountSourcesRequestBody {
	subdomain?: string;
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
};
