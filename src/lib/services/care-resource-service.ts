import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceLocationModel,
	CareResourceModel,
	CareResourceTag,
	PlaceModel,
} from '@/lib/models';
import { httpSingleton } from '@/lib/singletons';
import { buildQueryParamUrl } from '../utils';

type CareResourceRequestBody = {
	name: string;
	phoneNumber: string;
	emailAddress: string;
	websiteUrl: string;
	notes: string;
	insuranceNotes: string;
	payorIds: string[];
	specialtyIds: string[];
};

type CareResourceLocationRequestBody = {
	careResourceId: string;
	googlePlaceId: string;
	name: string;
	notes: string;
	emailAddress: string;
	streetAddress2: string;
	insuranceNotes: string;
	phoneNumber: string;
	websiteUrl: string;
	acceptingNewPatients: boolean;
	wheelchairAccess: boolean;
	payorIds?: string[];
	specialtyIds?: string[];
	therapyTypeIds: string[];
	populationServedIds: string[];
	genderIds: string[];
	ethnicityIds: string[];
	languageIds: string[];
};

export const careResourceService = {
	/* ----------------------------------------------------------- */
	/* Care Resource Tags */
	/* ----------------------------------------------------------- */
	getCareResourceTags(queryParams: { careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID }) {
		return httpSingleton.orchestrateRequest<{ careResourceTags: CareResourceTag[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/care-resource-tags', queryParams),
		});
	},

	/* ----------------------------------------------------------- */
	/* Places */
	/* ----------------------------------------------------------- */
	getPlaces(queryParams: { searchText: string }) {
		return httpSingleton.orchestrateRequest<{ places: PlaceModel[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/places/autocomplete', queryParams),
		});
	},

	/* ----------------------------------------------------------- */
	/* Care Resources */
	/* ----------------------------------------------------------- */
	createCareResource(data: CareResourceRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'POST',
			url: '/care-resources',
			data,
		});
	},
	updateCareResource(data: { careResourceId: string } & CareResourceRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'PUT',
			url: `/care-resources`,
			data,
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
	getCareResourcesAssociationList() {
		return httpSingleton.orchestrateRequest<{
			careResources: {
				careResourceId: string;
				name: string;
			}[];
		}>({
			method: 'GET',
			url: '/care-resources/association-list',
		});
	},

	/* ----------------------------------------------------------- */
	/* Care Resource Locations */
	/* ----------------------------------------------------------- */
	createCareResourceLocation(data: CareResourceLocationRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'POST',
			url: '/care-resources/location',
			data,
		});
	},
	updateCareResourceLocation(data: { careResourceLocationId: string } & CareResourceLocationRequestBody) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'PUT',
			url: '/care-resources/location',
			data,
		});
	},
	getCareResourceLocations(params?: {
		pageNumber?: string;
		pageSize?: string;
		searchQuery?: string;
		orderBy?: 'NAME_ASC' | 'NAME_DESC';
	}) {
		return httpSingleton.orchestrateRequest<{
			totalCountDescription: string;
			totalCount: number;
			careResourceLocations: CareResourceLocationModel[];
		}>({
			method: 'GET',
			url: '/care-resources/location',
			params,
		});
	},
	getCareResourceLocation(careResourceLocationId: string) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'GET',
			url: `/care-resources/location/${careResourceLocationId}`,
		});
	},
};
