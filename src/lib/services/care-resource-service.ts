import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceModel,
	CareResourceTag,
	PayorModel,
	SupportRoleModel,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';
import { buildQueryParamUrl } from '../utils';

export const careResourceService = {
	getCareResourceTags(queryParams: { careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID }) {
		return httpSingleton.orchestrateRequest<{ careResourceTags: CareResourceTag[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/care-resource-tags', queryParams),
		});
	},
	getSupportRoles() {
		return httpSingleton.orchestrateRequest<{ supportRoles: SupportRoleModel[] }>({
			method: 'GET',
			url: '/support-roles',
		});
	},
	getCareResources(params?: { pageNumber?: string; pageSize?: string }) {
		return httpSingleton.orchestrateRequest<{
			totalCountDescription: string;
			totalCount: number;
			careResources: CareResourceModel[];
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
