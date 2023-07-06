import {
	PatientOrderCarePreferenceId,
	PatientOrderDispositionId,
	PatientOrderResourcingTypeId,
	PatientOrderTriageStatusId,
} from './integrated-care-models';

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

export enum PatientOrderOutreachResultStatusId {
	UNKNOWN = 'UNKNOWN',
	CONNECTED = 'CONNECTED',
	NOT_CONNECTED = 'NOT_CONNECTED',
}

export interface PatientOrderOutreachResult {
	patientOrderOutreachResultId: string;
	patientOrderOutreachResultStatusDescription: string;
	patientOrderOutreachResultStatusId: PatientOrderOutreachResultStatusId;
	patientOrderOutreachResultTypeDescription: string;
	patientOrderOutreachResultTypeId: string;
	patientOrderOutreachTypeDescription: string;
	patientOrderOutreachTypeId: PatientOrderOutreachTypeId;
}

export interface PatientOrderScheduledMessageType {
	description: string;
	patientOrderScheduledMessageTypeId: string;
}

export interface PatientOrderCarePreference {
	description: string;
	patientOrderCarePreferenceId: PatientOrderCarePreferenceId;
}

export interface PatientOrderCareType {
	description: string;
	patientOrderCareTypeId: string;
}

export interface PatientOrderFocusType {
	description: string;
	patientOrderFocusTypeId: string;
}

export interface PatientOrderResourcingType {
	description: string;
	patientOrderResourcingTypeId: PatientOrderResourcingTypeId;
}

export interface PatientOrderInsurancePayors {
	institutionId: string;
	name: string;
	patientOrderInsurancePayorId: string;
	patientOrderInsurancePayorTypeId: string;
}

export interface PatientOrderInsurancePlans {
	accepted: boolean;
	name: string;
	patientOrderInsurancePayorId: string;
	patientOrderInsurancePlanId: string;
	patientOrderInsurancePlanTypeId: string;
}

export interface ReferenceDataResponse {
	birthSexes: BirthSex[];
	countries: Country[];
	ethnicities: Ethnicity[];
	genderIdentities: GenderIdentity[];
	languages: Language[];
	patientOrderCarePreferences: PatientOrderCarePreference[];
	patientOrderCareTypes: PatientOrderCareType[];
	patientOrderDispositions: PatientOrderDisposition[];
	patientOrderFocusTypes: PatientOrderFocusType[];
	primaryPayorNames: string[];
	patientOrderOutreachResults: PatientOrderOutreachResult[];
	patientOrderScheduledMessageTypes: PatientOrderScheduledMessageType[];
	patientOrderTriageStatuses: Record<PatientOrderTriageStatusId, string>[];
	patientOrderResourcingTypes: PatientOrderResourcingType[];
	races: Race[];
	reasonsForReferral: string[];
	referringPracticeNames: string[];
	regionsByCountryCode: Record<string, Region[]>;
	screeningTypes: ScreeningType[];
	timeZones: TimeZone[];
}
