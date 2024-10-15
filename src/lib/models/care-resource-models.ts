export interface CareResourceModel {
	carResourceId: string;
	name: string;
	phoneNumber: string;
	formattedPhoneNumber: string;
	createdByAccountId: string;
	careResourceLocations: CareResourceLocationModel[];
	payors: CareResourcePayorModel[];
	specialties: CareResourceSpecialyModel[];
	supportRoles: SupportRoleModel[];
}

export interface CareResourceLocationModel {
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
	payorId: string;
	name: string;
}

export interface CareResourcePayorModel extends PayorModel {
	created: string;
	lastUpdated: string;
}

export interface CareResourceSpecialyModel {
	careResourceSpecialtyId: string;
	name: string;
	created: string;
	lastUpdated: string;
}

export interface SupportRoleModel {
	supportRoleId: string;
	description: string;
}