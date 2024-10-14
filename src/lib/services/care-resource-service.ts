import { CareResourceModel, PayorModel, SupportRoleModel } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';

export interface GetCareResourcesResponseModel {
	careResources: {
		totalCountDescription: string;
		totalCount: number;
		careResources: CareResourceModel[];
	};
}

export const careResourceService = {
	getSupportRoles() {
		return httpSingleton.orchestrateRequest<{ supportRoles: SupportRoleModel[] }>({
			method: 'GET',
			url: '/support-roles',
		});
	},
	getCareResources(params?: { pageNumber?: string; pageSize?: string }) {
		return httpSingleton.orchestrateRequest<GetCareResourcesResponseModel>({
			method: 'GET',
			url: '/care-resources',
			params,
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
		resourceAvailable: string;
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
