import { AccountModel } from '@/lib/models';
import moment from 'moment';

export const isPicPatientAccount = (account: AccountModel) => {
	return account.sourceSystemId === 'PIC' && account.roleId === 'PATIENT';
};

export const isPicMhicAccount = (account: AccountModel) => {
	return account.institutionId === 'COBALT' && ['BHS', 'MHIC'].includes(account.roleId);
};

export const getFormattedPatientObject = (patient: PatientObject): FormattedPatientObject => {
	const findPhoneNumber = () => {
		const phone = patient?.epicProfile?.telecom.find((obj: { system: string; use: string }) => obj.system === 'phone' && obj.use === 'mobile');
		return phone ? phone.value : '';
	};

	const findPhoneNumbers = () => {
		const phoneNumbers = patient?.epicProfile?.telecom.filter((obj: { system: string }) => obj.system === 'phone');
		return phoneNumbers;
	};

	const findPreferredPhoneMethod = () => {
		const phone = patient?.epicProfile?.telecom.find((obj: { system: string; use: string; value: string }) => {
			if (obj.system === 'phone') {
				if (patient.preferredPhoneNumber === null && obj.use === 'mobile') {
					return obj;
				} else if (obj?.value === patient.preferredPhoneNumber) {
					return obj;
				}
			}
		});
		// set mobile as default number
		return phone ? phone.use : 'mobile';
	};

	const findEmail = () => {
		const email = patient?.epicProfile?.telecom.find((obj: { system: string }) => obj.system === 'email');
		return email ? email.value : '';
	};
	const getAge = () => (patient?.epicProfile?.birthDate ? moment().diff(patient.epicProfile.birthDate, 'years') : 0);
	const getDOB = () => (patient?.epicProfile?.birthDate ? moment(patient.epicProfile.birthDate).format('MM/DD/YY') : '');
	const findCareTeam = () => patient?.epicProfile?.generalPractitioner;
	const getEthnicity = () =>
		patient?.epicProfile?.extension && patient.epicProfile.extension.length > 0 ? patient.epicProfile.extension[1].extension[0].valueCoding.display : '';
	const getRace = () =>
		patient?.epicProfile?.extension && patient.epicProfile.extension.length > 0 ? patient.epicProfile.extension[0].extension[0].valueCoding.display : '';
	const findGivenName = () => (patient?.epicProfile?.name && patient.epicProfile.name[0].given.length > 0 ? patient.epicProfile.name[0].given[0] : '');
	const findFamilyName = () => (patient?.epicProfile?.name && patient.epicProfile.name[0].family ? patient.epicProfile.name[0].family : '');
	const findGender = () => (patient?.epicProfile?.gender ? patient.epicProfile.gender : '');

	return {
		cobaltAccountId: patient.cobaltAccountId,
		picPatientId: patient.id,
		displayName: patient.preferredGivenName || findGivenName(),
		familyName: patient.preferredFamilyName || findFamilyName(),
		gender: patient.preferredGender || findGender(),
		phone: patient?.preferredPhoneNumber || findPhoneNumber(),
		preferredPhoneMethod: findPreferredPhoneMethod(),
		phoneNumbers: findPhoneNumbers(),
		email: patient.preferredEmail || findEmail(),
		age: getAge(),
		pcp:
			patient?.epicProfile?.generalPractitioner && patient.epicProfile.generalPractitioner.length > 0
				? patient.epicProfile.generalPractitioner[0].display
				: '',
		city:
			patient?.epicProfile?.address && patient.epicProfile.address.length > 0 && patient.epicProfile.address[0].city
				? patient.epicProfile.address[0].city
				: '',
		state:
			patient?.epicProfile?.address && patient.epicProfile.address.length > 0 && patient.epicProfile.address[0].state
				? patient.epicProfile.address[0].state
				: '',
		zip:
			patient?.epicProfile?.address && patient.epicProfile.address.length > 0 && patient.epicProfile.address[0].postalCode
				? patient.epicProfile.address[0].postalCode
				: '',
		address: patient?.epicProfile?.address[0].line[0],
		ethnicity: getEthnicity(),
		race: getRace(),
		specialist: patient.specialist,
		referredToPic: patient.referredToPic,
		loggedIn: patient.loggedIn,
		patientGoals: patient.patientGoals,
		careTeam: findCareTeam(),
		dob: getDOB(),
		language: patient?.epicProfile?.communication && patient.epicProfile.communication.length > 0 ? patient.epicProfile.communication[0].language.text : '',
	};
};

export const formatDisposition = (disposition: Disposition): FormattedDisposition => {
	const getName = () =>
		`${disposition?.patient?.lastName ? disposition.patient.lastName : ''}, ${disposition?.patient?.firstName ? disposition.patient.firstName : ''}`;
	const getAcuity = () => {
		switch (disposition.acuity?.category) {
			case TriageEnums.low:
				return 'Mild';
			case TriageEnums.medium:
				return 'Moderate';
			case TriageEnums.high:
				return 'Severe';
			default:
				return '';
		}
	};
	const getTriageStatus = () => {
		if (disposition.outcome.care && disposition.outcome.diagnosis) {
			const careLabel = disposition.outcome && outcomeCareIdMapping(disposition.outcome.care.id);
			const diagnosisLabel = outcomeDiagnosisCodeMapping(disposition.outcome.diagnosis.code);
			return `${careLabel} ${careLabel ? ':' : ''} ${diagnosisLabel}`;
		} else {
			return '';
		}
	};

	const determineTriageValue = (value: string) => {
		if (disposition.triageReview === null) {
			return false;
		}

		switch (value) {
			case 'pinned':
				return disposition?.triageReview?.needsFocusedReview ? disposition?.triageReview?.needsFocusedReview : false;
			case 'bhpReviewed':
				return disposition?.triageReview?.bhpReviewedDt ? true : false;
			case 'psyReviewed':
				return disposition?.triageReview?.psychiatristReviewedDt ? true : false;
			default:
				return false;
		}
	};

	const getLastContact = () => {
		/* @ts-ignore*/
		const sortedDates = [...disposition.contact]
			.map((c) => moment(c.createdAt))
			.sort((d1, d2) => {
				return d1.isBefore(d2) ? 1 : d1.isAfter(d2) ? -1 : 0;
			});

		return sortedDates[0]?.format('MMM D, YYYY') ?? '-';
	};

	const getPreferredEngagement = () => {
		let engagementString = '';

		if (disposition?.orders && disposition.orders.length > 0 && disposition.orders[0]?.engagement) {
			const engagement = disposition.orders[0]?.engagement;

			switch (engagement) {
				case 'Phone by Resource Center':
					engagementString = 'Phone';
					break;
				case 'Self-directed digital assessment':
					engagementString = 'Digital';
					break;
				default:
					engagementString = engagement;
			}
		}

		return engagementString;
	};

	return {
		...disposition,
		displayName: getName(),
		displayAcuity: getAcuity(),
		displayTriage: getTriageStatus(),
		pinned: determineTriageValue('pinned'),
		bhpReviewed: determineTriageValue('bhpReviewed'),
		psyReviewed: determineTriageValue('psyReviewed'),
		lastContact: getLastContact(),
		preferredEngagement: getPreferredEngagement(),
	};
};

export const questionnaireIdToNameMapping = {
	'/93373-9': 'C-SSRS',
	'/69737-5': 'GAD-7',
	'/44249-1': 'PHQ-9',
	'/pic-isi': 'ISI',
	'/pic-ptsd5': 'PC-PTSD-5',
	'/pic-ASRM': 'ASRM',
	'/pic-PRIME5': 'PRIME-5',
	'/77564-3': 'BPI',
	'/72109-2': 'AUDIT-C',
	'/82666-9': 'DAST-10',
};

export enum CareType {
	'SUB_CLINICAL' = -1,
	'SELF_DIRECTED' = 0,
	'PIC' = 1,
	'SPECIALTY' = 2,
}

export const outcomeCareIdMapping: (id: CareType) => string = (id: CareType) => {
	switch (id) {
		case CareType.PIC:
			return 'PIC';
		case CareType.SPECIALTY:
			return 'Specialty';
		default:
			return '';
	}
};

export enum DiagnosisCode {
	'CRISIS_CARE' = 100,
	'LCSW_CAPACITY' = 0,
	'EATING_DISORDER' = 6,
	'TRAUMA_HIGH' = 4,
	'TRAUMA_MEDIUM' = 40,
	'ADHD' = 3,
	'EVALUATION' = 1,
	'OPIOID_USE_DISORDER' = 11,
	'SUD' = 5,
	'ALCOHOL_USE_DISORDER' = 7,
	'INSOMNIA' = 9,
	'GRIEF' = 10,
	'GENERAL' = 8,
	'PSYCOTHERAPY_ANDOR_MM' = 2,
	'SUB_CLINICAL' = -1,
}

export const outcomeDiagnosisCodeMapping: (code: DiagnosisCode) => string = (code: DiagnosisCode) => {
	switch (code) {
		case DiagnosisCode.SUB_CLINICAL:
			return 'Sub-clinical symptoms';
		case DiagnosisCode.LCSW_CAPACITY:
			return 'LCSW Capacity';
		case DiagnosisCode.EVALUATION:
			return 'Evaluation';
		case DiagnosisCode.PSYCOTHERAPY_ANDOR_MM:
			return 'Psychotheraphy and/or MM';
		case DiagnosisCode.ADHD:
			return 'ADHD';
		case DiagnosisCode.TRAUMA_HIGH:
			return 'Trauma';
		case DiagnosisCode.TRAUMA_MEDIUM:
			return 'Trauma - Evaluation';
		case DiagnosisCode.SUD:
			return 'SUD';
		case DiagnosisCode.EATING_DISORDER:
			return 'Eating disorder';
		case DiagnosisCode.ALCOHOL_USE_DISORDER:
			return 'Alcohol use disorder';
		case DiagnosisCode.GENERAL:
			return 'General';
		case DiagnosisCode.INSOMNIA:
			return 'Insomnia';
		case DiagnosisCode.GRIEF:
			return 'Grief';
		case DiagnosisCode.OPIOID_USE_DISORDER:
			return 'Opioid use disorder';
		case DiagnosisCode.CRISIS_CARE:
			return 'Crisis care';
	}
};

export interface PatientObject {
	id: string;
	cobaltAccountId: string | null;
	epicProfile: {
		name: [
			{
				family: string;
				given: string;
			}
		];
		generalPractitioner: [
			{
				display: string;
				reference: string;
			}
		];
		gender: string;
		birthDate: string;
		address: [
			{
				use: string;
				line: string[];
				city: string;
				district: string;
				state: string;
				postalCode: string;
				country: string;
			}
		];
		maritalStatus: {
			text: string;
		};
		telecom: [
			{
				system: string;
				value: string;
				use: string;
			},
			{
				system: string;
				value: string;
				use: string;
			},
			{
				system: string;
				value: string;
				use: string;
			},
			{
				system: string;
				value: string;
				use: string;
			}
		];
		communication: [
			{
				language: {
					text: string;
				};
				preferred: boolean;
			}
		];
		extension: [
			{
				url: string;
				extension: [
					{
						valueCoding: {
							display: string;
						};
					}
				];
			},
			{
				url: string;
				extension: [
					{
						valueCoding: {
							display: string;
						};
					}
				];
			}
		];
	};
	preferredGivenName?: string;
	preferredFamilyName?: string;
	preferredFirstName?: string;
	preferredLastName?: string;
	preferredGender?: string;
	preferredPhoneNumber?: string;
	preferredEmail?: string;
	specialist: string;
	referredToPic: string | null;
	loggedIn: string[];
	patientGoals: string[];
}

export interface FormattedPatientObject {
	cobaltAccountId: string | null;
	picPatientId: string;
	displayName: string;
	familyName: string;
	gender: string;
	phone: string;
	preferredPhoneMethod: string;
	phoneNumbers: TelecomNumbers[] | null;
	email: string;
	age: number;
	pcp: string;
	city: string;
	state: string;
	zip: string;
	address: string;
	ethnicity: string;
	race: string;
	specialist: string;
	referredToPic: string | null;
	loggedIn: string[];

	patientGoals: string[];
	careTeam: [
		{
			display: string;
			reference: string;
		}
	];
	dob: string;
	language: string;
}

export interface TelecomNumbers {
	system: string;
	value: string;
	use: string;
}

export interface Disposition {
	patient: DispositionPatient;
	crisisAcknowledged: boolean;
	outcome: Outcome;
	acuity: Acuity | null;
	id: string;
	flag: Flag;
	specialtyCareScheduling: {
		agency: string;
		date: string;
		time: string;
		notes: string;
		attendanceConfirmed: boolean;
	};
	triageReview: TriageReview;
	orders: Order[] | null;
	notes: DispositionNote[];
}

export interface IsBusinessHours {
	isBusinessHours: boolean;
}

export interface FormattedDisposition {
	id: string;
	triageReview: TriageReview;
	outcome: Outcome;
	notes: DispositionNote[];
	acuity: Acuity | null;
	flag: Flag;
	patient: DispositionPatient;
	orders: Order[] | null;
	displayName: string;
	displayAcuity: string;
	displayTriage: string | null;
	pinned: boolean;
	bhpReviewed: boolean;
	psyReviewed: boolean;
	lastContact: string;
	preferredEngagement: string;
}

export interface FormattedDispositionWithAppointments {
	id: string;
	triageReview: TriageReview;
	outcome: Outcome;
	responses: string[];
	notes: DispositionNote[];
	acuity: Acuity;
	flag: Flag;
	patient: DispositionPatient;
	orders: Order[] | null;
	displayName: string;
	displayAcuity: string;
	displayTriage: string;
	pinned: boolean;
	bhpReviewed: boolean;
	psyReviewed: boolean;
	lastContact: string;
	appointments: ScheduleDetail[];
	preferredEngagement: string;
}

export interface ScheduleDetail {
	id: string;
	dateString: string;
	formattedDateTime: string;
	formattedTableDate: string;
	type: string;
	reason: string;
	with: string;
	onCancel: () => Promise<void>;
}

export enum TriageEnums {
	low = 'LOW',
	medium = 'MEDIUM',
	high = 'HIGH',
}

export interface DispositionPatient {
	firstName: string;
	id: string;
	cobaltAccountId: string;
	lastName: string;
	preferredEngagement: string;
	preferredPhoneNumber: string;
}
export interface Acuity {
	value: number;
	category: TriageEnums;
}
export interface Flag {
	type: FlagType;
	label: string;
	id: FlagIdType;
}

export enum FlagType {
	General = 'GENERAL',
	Safety = 'SAFETY',
	None = 'NONE',
}

export enum FlagIdType {
	START_PHONE_SCREENING = 0,
	REMIND_ABOUT_DIGITAL_SCREENING = 1,
	FINAL_OUTREACH_ATTEMPT = 2,
	SCHEDULE_WITH_PIC = 3,
	NEEDS_FURTHER_ASSESSMENT_WITH_MHIC = 4,
	COORDINATE_REFERRAL = 5,
	CONFIRM_REFERRAL_CONNECTION = 6,
	NEEDS_INITIAL_SAFETY_PLANNING = 7,
	NEEDS_SAFETY_PLANNING_FOLLOW = 8,
	NOT_YET_SCREENED = 11,
	AWAITING_PIC_SCHEDULING = 12,
	AWAITING_FIRST_PIC_APPOINTMENT = 13,
	AWAITING_FIRST_EXTERNAL_APPOINTMENT = 14,
	IN_PIC_TREATMENT = 15,
	GRADUATED = 16,
	CONNECTED_TO_CARE = 17,
	LOST_CONTACT_WITH_PATIENT = 18,
	OPTIONAL_REFERRAL = 19,
}
export interface Outcome {
	crisis: boolean;
	diagnosis: Diagnosis | null;
	care: Care | null;
}
export interface Diagnosis {
	code: DiagnosisCode;
	name: string;
}
export interface Care {
	id: CareType;
	label: string;
}

export interface TriageReview {
	bhpReviewedDt: string | null;
	psychiatristReviewedDt: string | null;
	comment: string;
	needsFocusedReview: boolean;
}
export interface Order {
	mrn: string;
	reasonForReferral: string;
	dx: string;
	billingProvider: string;
	orderingProvider: string;
	medications: string;
	orderDate: string;
	engagement: string;
	insurance: string;
}
export interface Appointment {
	appointmentTime: undefined | string;
	scheduleBy: string;
}

export type AssessmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'STALE';

export interface PicAssessment {
	id: string;
	status: AssessmentStatus;
	due: string;
	authoredBy: string;
}

export interface DispositionNote {
	dispositionNoteId: string;
	accountId: string;
	authorDescription: string;
	note: string;
	createdDt: string;
	createdDtDescription: string;
}

export interface Contact {
	id: string;
	authoredBy: string;
	createdAt: string;
	note: string;
	callResult: CallResultType;
	referringLocation: ReferringLocationType;
}
export interface CreatedContact {
	id: string;
	authoredBy: string;
	note: string;
	callResult: CallResultType;
	referringLocation: ReferringLocationType;
}

export enum CallResultType {
	LEFT_VOICE_MAIL = 'LEFT_VOICE_MAIL',
	LEFT_MESSAGE = 'LEFT_MESSAGE',
	NO_ANSWER = 'NO_ANSWER',
	BUSY = 'BUSY',
	DISCONNECTED_WRONG_NUMBER = 'DISCONNECTED_WRONG_NUMBER',
	DISCUSSED_APPOINTMENT_TIME = 'DISCUSSED_APPOINTMENT_TIME',
	DISCUSSED_DIGITAL_SCREENING_REMINDER = 'DISCUSSED_DIGITAL_SCREENING_REMINDER',
	SENT_EMAIL = 'SENT_EMAIL',
	SENT_TEXT_MESSAGE = 'SENT_EMAIL',
	SENT_LETTER = 'SENT_LETTER',
}

export enum CallResultIdType {
	LEFT_VOICE_MAIL = 0,
	LEFT_MESSAGE = 1,
	NO_ANSWER = 2,
	BUSY = 3,
	DISCONNECTED_WRONG_NUMBER = 4,
	DISCUSSED_APPOINTMENT_TIME = 5,
	DISCUSSED_DIGITAL_SCREENING_REMINDER = 6,
	SENT_EMAIL = 7,
	SENT_TEXT_MESSAGE = 8,
	SENT_LETTER = 9,
}

export enum ReferringLocationType {
	COBALT_FAMILY_CARE_989 = 'COBALT_FAMILY_CARE_989',
	COBALT_INTERNAL_MEDICINE_UNIVERSITY_CITY_29 = 'COBALT_INTERNAL_MEDICINE_UNIVERSITY_CITY_29',
	SPRUCE_INTERNAL_MEDICINE_810 = 'SPRUCE_INTERNAL_MEDICINE_810',
	DELANCEY_MEDICAL_ASSOCIATES_812 = 'DELANCEY_MEDICAL_ASSOCIATES_812',
	FAMILY_MEDICINE_COBALT_MEDICINE_UNIVERSITY_CITY_1413 = 'FAMILY_MEDICINE_COBALT_MEDICINE_UNIVERSITY_CITY_1413',
	EDWARD_S_COOPER_INTERNAL_MEDICINE_PRACTICE_37 = 'EDWARD_S_COOPER_INTERNAL_MEDICINE_PRACTICE_37',
	COBALT_CENTER_FOR_PRIMARY_CARE_2 = 'COBALT_CENTER_FOR_PRIMARY_CARE_2',
	RADNOR_GERIATRICS_1439 = 'COBALT_CENTER_FOR_PRIMARY_CARE_2',
	RADNOR_INTERNAL_MEDICINE_1438 = 'RADNOR_INTERNAL_MEDICINE_1438',
}
export interface UpdateTriageReview {
	bhpReviewedDt: string | null;
	psychiatristReviewedDt: string | null;
	comment: string;
	needsFocusedReview: boolean;
}

export interface UpdatedOutcome {
	code: number;
}

export interface UpdatedFlag {
	id: number;
}
export interface UpdatedDemographics {
	email: string;
	phone: string;
}

export interface QuestionnaireResponse {
	id: string;
	createdDt: Date;
	updatedDt: Date;
	deleted: boolean;
	questionnaireType: string;
	response: Response;
	patient: Patient;
	score: number;
	acuity: null;
}

export interface Patient {
	id: string;
	createdDt: Date;
	updatedDt: Date;
	deleted: boolean;
	loggedInDt: Date[];
	fhirID: string;
	fhirProvider: null;
	goals: any[];
	preferredFirstName: string;
	preferredLastName: string;
	preferredEmail: string;
	preferredPhoneNumber: string;
	preferredGender: string;
	mrn: string;
	cobaltAccountID: string;
	orderIDS: any[];
}

export interface Response {
	resourceType: string;
	questionnaire: string;
	status: string;
	item: ResponseItem[];
}

export interface ResponseItem {
	linkID: string;
	text: string;
	item: ItemItem[];
}

export interface ItemItem {
	linkID: string;
	text: string;
	answer: Answer[];
}

export interface Answer {
	valueCoding: ValueCoding;
}

export interface ValueCoding {
	extension: Extension[];
	code: string;
	display: string;
	userSelected: boolean;
}

export interface Extension {
	url: string;
	valueDecimal: number;
}
