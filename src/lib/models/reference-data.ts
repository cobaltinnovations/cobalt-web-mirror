interface BirthSex {
	birthSexId: string;
	description: string;
}

interface Country {
	countryCode: string;
	description: string;
}

interface Ethnicity {
	ethnicityId: string;
	description: string;
}

interface GenderIdentity {
	genderIdentityId: string;
	description: string;
}

interface Insurance {
	insuranceId: string;
	insuranceTypeId: string;
	description: string;
}

interface Language {
	languageCode: string;
	description: string;
}

interface Race {
	raceId: string;
	description: string;
}

interface Region {
	name: string;
	abbreviation: string;
}

interface TimeZone {
	timeZone: string;
	description: string;
}

export interface ReferenceDataResponse {
	birthSexes: BirthSex[];
	countries: Country[];
	ethnicities: Ethnicity[];
	genderIdentities: GenderIdentity[];
	insurances: Insurance[];
	languages: Language[];
	races: Race[];
	regionsByCountryCode: Record<string, Region[]>;
	timeZones: TimeZone[];
}
