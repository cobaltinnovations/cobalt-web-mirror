import { PatientOrderDispositionId, PatientOrderTriageStatusId } from './integrated-care-models';

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

export interface PatientOrderDisposition {
	patientOrderDispositionId: PatientOrderDispositionId;
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
	overallScoreMaximum: number;
	overallScoreMaximumDescription: string;
	screeningTypeId: string;
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

export interface PatientOrderCareType {
	description: string;
	patientOrderCareTypeId: string;
}

export interface PatientOrderFocusType {
	description: string;
	patientOrderFocusTypeId: string;
}

export interface ReferenceDataResponse {
	birthSexes: BirthSex[];
	countries: Country[];
	ethnicities: Ethnicity[];
	genderIdentities: GenderIdentity[];
	insurances: Insurance[];
	languages: Language[];
	patientOrderCareTypes: PatientOrderCareType[];
	patientOrderDispositions: PatientOrderDisposition[];
	patientOrderFocusTypes: PatientOrderFocusType[];
	patientOrderOutreachResults: PatientOrderOutreachResult[];
	patientOrderScheduledMessageTypes: PatientOrderScheduledMessageType[];
	patientOrderTriageStatuses: Record<PatientOrderTriageStatusId, string>[];
	races: Race[];
	regionsByCountryCode: Record<string, Region[]>;
	screeningTypes: ScreeningType[];
	timeZones: TimeZone[];
}
