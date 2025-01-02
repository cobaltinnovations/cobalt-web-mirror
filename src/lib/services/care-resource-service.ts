import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceLocationModel,
	CareResourceModel,
	CareResourceTag,
	PlaceModel,
	ResourcePacketModel,
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
	acceptingNewPatients: boolean;
	appointmentTypeInPerson: boolean;
	appointmentTypeOnline: boolean;
	careResourceId: string;
	emailAddress: string;
	ethnicityIds: string[];
	facilityTypes: string[];
	genderIds: string[];
	googlePlaceId: string;
	insuranceNotes: string;
	languageIds: string[];
	name: string;
	notes: string;
	overridePayors: boolean;
	overrideSpecialties: boolean;
	payorIds?: string[];
	phoneNumber: string;
	populationServedIds: string[];
	specialtyIds?: string[];
	streetAddress2: string;
	therapyTypeIds: string[];
	websiteUrl: string;
	wheelchairAccess: boolean;
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
	deleteCareResource(careResourceId: string) {
		return httpSingleton.orchestrateRequest<{ careResource: CareResourceModel }>({
			method: 'DELETE',
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
	deleteCareResourceLocation(careResourceLocationId: string) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'DELETE',
			url: `/care-resources/location/${careResourceLocationId}`,
		});
	},
	getCareResourceLocation(careResourceLocationId: string) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'GET',
			url: `/care-resources/location/${careResourceLocationId}`,
		});
	},
	getCareResourceLocations(params?: {
		pageNumber?: number;
		pageSize?: number;
		searchQuery?: string;
		orderBy?: 'NAME_ASC' | 'NAME_DESC';
		wheelchairAccess?: boolean;
		searchRadiusMiles?: number;
		payorIds?: string[];
		specialtyIds?: string[];
		therapyTypeIds?: string[];
		populationServedIds?: string[];
		genderIds?: string[];
		ethnicityIds?: string[];
		languageIds?: string[];
		facilityTypes?: string[];
		googlePlaceId?: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			totalCountDescription: string;
			totalCount: number;
			careResourceLocations: CareResourceLocationModel[];
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/care-resources/locations', params),
		});
	},
	addInternalNotes(data: { careResourceLocationId: string; internalNotes: string }) {
		return httpSingleton.orchestrateRequest<{ careResourceLocation: CareResourceLocationModel }>({
			method: 'PUT',
			url: '/care-resources/location/internal-notes',
			data,
		});
	},
	addCareResourceLocationToPatientOrderResourcePacket(data: {
		resourcePacketId: string;
		careResourceLocationId: string;
	}) {
		return httpSingleton.orchestrateRequest<{ resourcePacketCareResourceLocationId: string }>({
			method: 'POST',
			url: '/resource-packets/location',
			data,
		});
	},
	removeCareResourceLocationToPatientOrderResourcePacket(resourcePacketCareResourceLocationId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'DELETE',
			url: `/resource-packets/location/${resourcePacketCareResourceLocationId}`,
		});
	},
	reorderCareResourceLocationPacket(resourcePacketCareResourceLocationId: string, data: { displayOrder: number }) {
		return httpSingleton.orchestrateRequest<ResourcePacketModel>({
			method: 'PUT',
			url: `/resource-packets/location/${resourcePacketCareResourceLocationId}`,
			data,
		});
	},
};
