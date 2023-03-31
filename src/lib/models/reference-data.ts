import { PatientOrderDisposition, PatientOrderStatus } from './integrated-care-models';

interface BirthSex {
	birthSexId: string;
	description: string;
}

interface Country {
	countryCode: string;
	description: string;
}

export interface Ethnicity {
	ethnicityId: string;
	description: string;
}

export interface GenderIdentity {
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

export interface Race {
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

export interface ScreeningType {
	description: string;
	screeningTypeId: string;
	overallScoreMaximum: 20;
}

export enum PatientOrderOutreachTypeId {
	PHONE_CALL = 'PHONE_CALL',
	MYCHART_MESSAGE = 'MYCHART_MESSAGE',
}

export interface PatientOrderOutreachResult {
	patientOrderOutreachResultId: string;
	patientOrderOutreachResultStatusDescription: string;
	patientOrderOutreachResultStatusId: string;
	patientOrderOutreachResultTypeDescription: string;
	patientOrderOutreachResultTypeId: string;
	patientOrderOutreachTypeDescription: string;
	patientOrderOutreachTypeId: PatientOrderOutreachTypeId;
}

export interface PatientOrderScheduledMessageType {
	description: string;
	patientOrderScheduledMessageTypeId: string;
}

export interface ReferenceDataResponse {
	birthSexes: BirthSex[];
	countries: Country[];
	ethnicities: Ethnicity[];
	genderIdentities: GenderIdentity[];
	insurances: Insurance[];
	languages: Language[];
	patientOrderDispositions: PatientOrderDisposition[];
	patientOrderOutreachResults: PatientOrderOutreachResult[];
	patientOrderScheduledMessageTypes: PatientOrderScheduledMessageType[];
	patientOrderStatuses: PatientOrderStatus[];
	races: Race[];
	regionsByCountryCode: Record<string, Region[]>;
	screeningTypes: ScreeningType[];
	timeZones: TimeZone[];
}
