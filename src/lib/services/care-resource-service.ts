import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceLocationModel,
	CareResourceModel,
	CareResourceTag,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';
import { buildQueryParamUrl } from '../utils';

interface CareResourceCreateAndUpdateRequestBody {
	name: string;
	phoneNumber: string;
	emailAddress: string;
	websiteUrl: string;
	notes: string;
	insuranceNotes: string;
	payorIds: string[];
	specialtyIds: string[];
}

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
	createCareResource(data: CareResourceCreateAndUpdateRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'POST',
			url: '/care-resources',
			data,
		});
	},
	updateCareResource(careResourceId: string, data: CareResourceCreateAndUpdateRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'PUT',
			url: `/care-resources/${careResourceId}`,
			data,
		});
	},
};
