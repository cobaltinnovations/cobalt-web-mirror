import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceLocationModel,
	CareResourceModel,
	CareResourceTag,
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
	getCareResources(params?: {
		pageNumber?: string;
		pageSize?: string;
		searchQuery?: string;
		orderBy?: 'NAME_ASC' | 'NAME_DESC';
	}) {
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
	getCareResourceLocation(careResourceLocationId: string) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'GET',
			url: `/care-resource-location/${careResourceLocationId}`,
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
