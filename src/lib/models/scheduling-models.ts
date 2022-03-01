import { LogicalAvailability } from '@/lib/models';

export interface SchedulingAppointmentType {
	appointmentTypeId: string;
	schedulingSystemId: string;
	visitTypeId: string;
	name: string;
	durationInMinutes: number;
	durationInMinutesDescription: string;
	hexColor: string;
	assessmentId: string;
	patientIntakeQuestions: PatientIntakeQuestion[];
	screeningQuestions: ScreeningQuestion[];
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
	availabilities: LogicalAvailability[];
	blocks: Omit<LogicalAvailability, 'appointmentTypes'>[];
	followups: any[];
}
