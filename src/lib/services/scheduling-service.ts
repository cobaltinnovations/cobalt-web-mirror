import { httpSingleton } from '@/lib/singletons/http-singleton';
import { OrchestratedRequest } from '@/lib/http-client';
import { SchedulingAppointmentType, PatientIntakeQuestion, ScreeningQuestion } from '@/lib/models';

interface PostApointmentTypeRequest {
	name: string;
	description: string;
	schedulingSystemId: string;
	visitTypeId: string;
	durationInMinutes: number;
	hexColor: string;
	patientIntakeQuestions: PatientIntakeQuestion[];
	screeningQuestions: ScreeningQuestion[];
}

interface PostApointmentTypeResponse {
	appointmentType: SchedulingAppointmentType;
}

export const schedulingService = {
	postApointmentType(data: PostApointmentTypeRequest): OrchestratedRequest<PostApointmentTypeResponse> {
		return httpSingleton.orchestrateRequest({
			method: 'POST',
			url: '/appointment-types',
			data,
		});
	},
};
