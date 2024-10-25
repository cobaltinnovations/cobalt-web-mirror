export interface CareResourceModel {
	careResourceId: string;
	name: string;
	notes?: string;
	insuranceNotes?: string;
	phoneNumber?: string;
	formattedPhoneNumber?: string;
	websiteUrl?: string;
	emailAddress?: string;
	createdByAccountId: string;
	specialties: CareResourceTag[];
	payors: CareResourceTag[];
	careResourceLocations: CareResourceLocationModel[];
}

export interface CareResourceLocationModel {
	careResourceId: string;
	careResourceLocation: CareResourceGooglePlaceModel;
	createdByAccountId: string;
	phoneNumber: string;
	formattedPhoneNumber: string;
	name: string;
	websiteUrl: string;
	payors: CareResourceTag[];
	specialties: CareResourceTag[];
	supportRoles: CareResourceTag[];
}

export interface CareResourceGooglePlaceModel {
	careResourceLocationId: string;
	address: {
		addressId: string;
		postalName: string;
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		countryCode: string;
		googleMapsUrl: string;
		googlePlaceId: string;
		latitude: number;
		longitude: number;
		subpremise: string;
		regionSubdivision: string;
		formattedAddress: string;
		phoneNumber: string;
		formattedPhoneNumber: string;
	};
}

export interface PayorModel {
	name: string;
	payorId: string;
}

export interface CareResourcePayorModel extends PayorModel {
	created: string;
	lastUpdated: string;
}

export interface CareResourceSpecialtyModel {
	careResourceSpecialtyId: string;
	name: string;
	created: string;
	lastUpdated: string;
}

export interface SupportRoleModel {
	supportRoleId: string;
	description: string;
}

export enum CARE_RESOURCE_TAG_GROUP_ID {
	PAYORS = 'PAYORS',
	SPECIALTIES = 'SPECIALTIES',
	THERAPY_TYPES = 'THERAPY_TYPES',
	GENDERS = 'GENDERS',
	ETHNICITIES = 'ETHNICITIES',
	LANGUAGES = 'LANGUAGES',
	POPULATION_SERVED = 'POPULATION_SERVED',
}

export interface CareResourceTag {
	careResourceTagId: string;
	name: string;
	careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID;
}

export interface PlaceModel {
	placeId: string;
	text: string;
}
