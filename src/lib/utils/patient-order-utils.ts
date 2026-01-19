import { PatientOrderModel, PatientOrderTriageStatusId } from '@/lib/models';

export const isSpecialtyCareWithSchedulingOverride = (patientOrder: PatientOrderModel) =>
	patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE &&
	!!patientOrder.overrideSchedulingEpicDepartmentId;

export const shouldUseSchedulingWorkflow = (patientOrder: PatientOrderModel) =>
	patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP ||
	isSpecialtyCareWithSchedulingOverride(patientOrder);

export const getDepartmentTriageDefaultLabel = (patientOrder: PatientOrderModel) => {
	switch (patientOrder.patientOrderTriageStatusId) {
		case PatientOrderTriageStatusId.SPECIALTY_CARE:
			return 'EXTERNAL RESOURCES (default)';
		case PatientOrderTriageStatusId.MHP:
			return 'INTERNAL - Referring Department (default)';
		default:
			return 'Default';
	}
};
