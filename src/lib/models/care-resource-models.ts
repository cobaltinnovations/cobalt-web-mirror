export interface CareResourceModel {
	careResourceId: string;
	name: string;
	phoneNumber: string;
	formattedPhoneNumber: string;
	createdByAccountId: string;
	careResourceLocations: CareResourceLocationModel[];
	payors: CareResourcePayorModel[];
	specialties: CareResourceSpecialtyModel[];
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
