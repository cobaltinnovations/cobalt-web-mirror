import { CareResourceModel, PayorModel, SupportRoleModel } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';

export const careResourceService = {
	getSupportRoles() {
		return httpSingleton.orchestrateRequest<{ supportRoles: SupportRoleModel[] }>({
			method: 'GET',
			url: '/support-roles',
		});
	},
	getCareResources(params?: { pageNumber?: string; pageSize?: string }) {
		return httpSingleton.orchestrateRequest<{
			careResources: {
				totalCountDescription: string;
				totalCount: number;
				careResources: CareResourceModel[];
			};
		}>({
			method: 'GET',
			url: '/care-resources',
			params,
		});
	},
	getCareResource(careResourceId: string) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'GET',
			url: `/care-resources/${careResourceId}`,
		});
	},
	getPayors() {
		return httpSingleton.orchestrateRequest<{ payors: PayorModel[] }>({
			method: 'GET',
			url: '/payors',
		});
	},
	createCareResource(data: {
		name: string;
		notes: string;
		phoneNumber: string;
		websiteUrl: string;
		resourceAvailable: boolean;
		specialtyIds: string[];
		supportRoleIds: string[];
		payorIds: string[];
	}) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'POST',
			url: '/care-resources',
			data,
		});
	},
};
