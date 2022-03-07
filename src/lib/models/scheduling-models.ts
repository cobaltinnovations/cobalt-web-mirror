import { AppointmentModel, AppointmentType, FollowupModel } from '@/lib/models';

export interface SchedulingAppointmentType {
	appointmentTypeId: string;
	schedulingSystemId: string;
	visitTypeId: string;
	acuityAppointmentTypeId: string;
	epicVisitTypeId: string;
	epicVisitTypeIdType: string;
	name: string;
	description: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	hexColor: string;
	assessmentId: string;
	patientIntakeQuestions: PatientIntakeQuestion[];
	screeningQuestions: ScreeningQuestion[];
}

export interface SchedulingAvailability {
	appointmentTypes: AppointmentType[];
	endDateTime: string;
	endDateTimeDescription: string;
	logicalAvailabilityId: string;
	startDateTime: string;
	startDateTimeDescription: string;
}

export interface PatientIntakeQuestion {
	question: string;
	fontSizeId: 'DEFAULT' | 'SMALL';
	questionContentHintId: string; // 'FIRST_NAME' | 'LAST_NAME' | 'EMAIL_ADDRESS' | 'PHONE_NUMBER';
}

export interface ScreeningQuestion {
	question: string;
	fontSizeId: 'DEFAULT' | 'SMALL';
}

export interface ProviderCalendar {
	providerId: string;
	availabilities: SchedulingAvailability[];
	blocks: Omit<SchedulingAvailability, 'appointmentTypes'>[];
	followups: FollowupModel[];
	appointments: AppointmentModel[];
}
