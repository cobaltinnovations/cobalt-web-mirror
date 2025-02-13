import { httpSingleton } from '@/lib/singletons/http-singleton';
import { InstitutionFeatureInstitutionReferrer, InstitutionReferrer } from '@/lib/models';

export const institutionReferrersService = {
	getReferrerByFeatureId(featureId: string) {
		return httpSingleton.orchestrateRequest<{
			institutionReferrers: InstitutionReferrer[];
			institutionFeatureInstitutionReferrers: InstitutionFeatureInstitutionReferrer[];
		}>({
			method: 'get',
			url: `/institution-feature-institution-referrers/${featureId}`,
		});
	},
	getReferrerByUrlName(urlName: string) {
		return httpSingleton.orchestrateRequest<{
			institutionReferrer: InstitutionReferrer;
		}>({
			method: 'get',
			url: `/institution-referrers/${urlName}`,
		});
	},
};
