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
	resourceName: string;
	resourceNotes: string;
	name: string;
	careResourceLocationId: string;
	appointmentTypeInPerson: boolean;
	appointmentTypeOnline: boolean;
	address: {
		addressId: string;
		postalName: string;
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		countryCode: string;
		googlePlaceId: string;
		latitude: number;
		longitude: number;
		formattedAddress: string;
	};
	phoneNumber: string;
	emailAddress: string;
	websiteUrl: string;
	insuranceNotes: string;
	formattedPhoneNumber: string;
	notes: string;
	internalNotes: string;
	wheelchairAccess: boolean;
	acceptingNewPatients: boolean;
	languages: CareResourceTag[];
	specialties: CareResourceTag[];
	payors: CareResourceTag[];
	therapyTypes: CareResourceTag[];
	populationServed: CareResourceTag[];
	genders: CareResourceTag[];
	ethnicities: CareResourceTag[];
	facilityTypes: CareResourceTag[];
	overridePayors: boolean;
	overrideSpecialties: boolean;
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
	ETHNICITIES = 'ETHNICITIES',
	FACILITY_TYPES = 'FACILITY_TYPES',
	GENDERS = 'GENDERS',
	LANGUAGES = 'LANGUAGES',
	PAYORS = 'PAYORS',
	POPULATION_SERVED = 'POPULATION_SERVED',
	SPECIALTIES = 'SPECIALTIES',
	THERAPY_TYPES = 'THERAPY_TYPES',
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
