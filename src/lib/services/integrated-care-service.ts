import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	AccountModel,
	OpenPatientOrderCountModel,
	PatientOrderAutocompleteResult,
	PatientOrderClosureReasonModel,
	PatientOrderConsentStatusId,
	PatientOrderCountModel,
	PatientOrderFilterFlagTypeId,
	PatientOrderModel,
	PatientOrderNoteModel,
	PatientOrderOutreachModel,
	PatientOrderResourceCheckInResponseStatusId,
	PatientOrderResourcingStatusId,
	PatientOrderResourcingTypeId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderScheduledMessageGroup,
	PatientOrderScheduledScreening,
	PatientOrderScreeningStatusId,
	PatientOrderTriageStatusId,
	PatientOrderViewTypeId,
	ReferenceDataResponse,
} from '@/lib/models';

export interface MhicPanelTodayResponse {
	scheduledAssessmentPatientOrders: PatientOrderModel[];
	safetyPlanningPatientOrders: PatientOrderModel[];
	outreachReviewPatientOrders: PatientOrderModel[];
	outreachFollowupNeededPatientOrders: PatientOrderModel[];
	needResourcesPatientOrders: PatientOrderModel[];
	voicemailTaskPatientOrders: PatientOrderModel[];
}

export interface PatientOrdersListResponse {
	findResult: {
		patientOrders: PatientOrderModel[];
		totalCount: number;
		totalCountDescription: string;
	};
	activePatientOrdersCount: number;
	activePatientOrdersCountDescription: string;
	activePatientOrderCountsByPatientOrderStatusId: Record<PatientOrderTriageStatusId, PatientOrderCountModel>;
}

export interface PatientOrderPanelCountsResponse {
	patientOrderCountsByPatientOrderViewTypeId: Record<
		PatientOrderViewTypeId,
		{
			patientOrderCount: number;
			patientOrderCountDescription: string;
		}
	>;
}

export interface LatestPatientOrderResponse {
	patientOrder: PatientOrderModel;
}

export interface PatientOrderResponse {
	patientOrder: PatientOrderModel;
	associatedPatientOrders: PatientOrderModel[];
}

export interface PanelAccountsResponse {
	panelAccounts: AccountModel[];
	openPatientOrderCountsByPanelAccountId: Record<string, OpenPatientOrderCountModel>;
	overallActivePatientOrderCount: number;
	overallActivePatientOrderCountDescription: string;
}

export interface PatientOrderDemographicsFormData {
	patientLastName: string;
	patientFirstName: string;
	patientEmailAddress: string;
	patientPhoneNumber: string;
	patientBirthSexId: string;
	patientBirthdate: string;
	patientEthnicityId: string;
	patientRaceId: string;
	patientGenderIdentityId: string;
	patientLanguageCode: string;
	patientAddress: {
		postalName: string;
		streetAddress1: string;
		streetAddress2: string;
		locality: string;
		region: string;
		postalCode: string;
		countryCode: string;
	};
	patientOrderInsurancePlanId: string;
	patientDemographicsConfirmed: boolean;
}

export enum PatientOrderResponseSupplement {
	MINIMAL = 'MINIMAL',
	PANEL = 'PANEL',
	EVERYTHING = 'EVERYTHING',
}

export interface PatientOrderApiQueryParameters {
	patientOrderTriageStatusId?: string | string[];
	patientOrderAssignmentStatusId?: string;
	patientOrderOutreachStatusId?: string;
	patientOrderResponseStatusId?: string;
	patientOrderSafetyPlanningStatusId?: string;
	patientOrderDispositionId?: string | string[];
	panelAccountId?: string | string[];
	patientMrn?: string;
	searchQuery?: string;
	pageNumber?: string;
	pageSize?: string;
	patientOrderFilterFlagTypeId?: PatientOrderFilterFlagTypeId;
	referringPracticeNames?: string | string[];
	reasonsForReferral?: string | string[];
	patientOrderScreeningStatusId?: PatientOrderScreeningStatusId | PatientOrderScreeningStatusId[];
	patientOrderResourcingStatusId?: PatientOrderResourcingStatusId | PatientOrderResourcingStatusId[];
	patientOrderResourceCheckInResponseStatusId?:
		| PatientOrderResourceCheckInResponseStatusId
		| PatientOrderResourceCheckInResponseStatusId[];
	patientOrderSortColumnId?: string;
	sortDirectionId?: string;
	sortNullsId?: string;
}

export const integratedCareService = {
	importPatientOrders(data: { csvContent: string }) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: '/patient-order-imports',
			data,
		});
	},
	autocompletePatientOrders(queryParameters: { searchQuery: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrderAutocompleteResults: PatientOrderAutocompleteResult[];
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/patient-orders/autocomplete', queryParameters),
		});
	},
	getPatientOrders(queryParameters?: PatientOrderApiQueryParameters) {
		return httpSingleton.orchestrateRequest<PatientOrdersListResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/patient-orders', queryParameters),
		});
	},
	getPanelAccounts() {
		return httpSingleton.orchestrateRequest<PanelAccountsResponse>({
			method: 'GET',
			url: '/integrated-care/panel-accounts',
		});
	},
	getPanelCounts(queryParameters?: { panelAccountId?: string }) {
		return httpSingleton.orchestrateRequest<PatientOrderPanelCountsResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/integrated-care/panel-counts', queryParameters),
		});
	},
	getOpenOrderForCurrentPatient() {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'GET',
			url: `/patient-orders/open`,
		});
	},
	patchPatientOrder(patientOrderId: string, data: Partial<PatientOrderDemographicsFormData>) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PATCH',
			url: `/patient-orders/${patientOrderId}`,
			data,
		});
	},
	getPatientOrder(patientOrderId: string, supplements: PatientOrderResponseSupplement[] = []) {
		const queryParams = new URLSearchParams();

		for (const supplement of supplements) {
			queryParams.append('responseSupplement', supplement);
		}

		return httpSingleton.orchestrateRequest<PatientOrderResponse>({
			method: 'GET',
			url: `/patient-orders/${patientOrderId}?${queryParams.toString()}`,
		});
	},
	postNote(data: { patientOrderId: string; note: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'POST',
			url: '/patient-order-notes',
			data,
		});
	},
	updateNote(patientOrderNoteId: string, data: { note: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'PUT',
			url: `/patient-order-notes/${patientOrderNoteId}`,
			data,
		});
	},
	deleteNote(patientOrderNoteId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'DELETE',
			url: `/patient-order-notes/${patientOrderNoteId}`,
		});
	},
	postPatientOrderOutreach(data: {
		patientOrderId: string;
		patientOrderOutreachResultId: string;
		outreachDate: string;
		outreachTime: string;
		note: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'POST',
			url: '/patient-order-outreaches',
			data,
		});
	},
	updatePatientOrderOutreach(
		patientOrderOutreachId: string,
		data: {
			patientOrderOutreachResultId: string;
			outreachDate: string;
			outreachTime: string;
			note: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'PUT',
			url: `/patient-order-outreaches/${patientOrderOutreachId}`,
			data,
		});
	},
	deletePatientOrderOutreach(patientOrderOutreachId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'DELETE',
			url: `/patient-order-outreaches/${patientOrderOutreachId}`,
		});
	},
	getPatientOrderClosureReasons() {
		return httpSingleton.orchestrateRequest<{
			patientOrderClosureReasons: PatientOrderClosureReasonModel[];
		}>({
			method: 'GET',
			url: '/patient-order-closure-reasons',
		});
	},
	closePatientOrder(patientOrderId: string, data: { patientOrderClosureReasonId: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/close`,
			data,
		});
	},
	openPatientOrder(patientOrderId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/open`,
		});
	},
	getReferenceData() {
		return httpSingleton.orchestrateRequest<ReferenceDataResponse>({
			method: 'GET',
			url: '/patient-orders/reference-data',
		});
	},
	assignPatientOrders(data: { panelAccountId: string; patientOrderIds: string[] }) {
		return httpSingleton.orchestrateRequest<ReferenceDataResponse>({
			method: 'POST',
			url: '/patient-orders/assign',
			data,
		});
	},
	sendMessage(data: {
		patientOrderId: string;
		patientOrderScheduledMessageTypeId: string;
		messageTypeIds: string[];
		scheduledAtDate: string;
		scheduledAtTime: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			patientOrderScheduledMessageGroup: PatientOrderScheduledMessageGroup;
		}>({
			method: 'POST',
			url: '/patient-order-scheduled-message-groups',
			data,
		});
	},
	updateMessage(
		patientOrderScheduledMessageGroupId: string,
		data: {
			patientOrderScheduledMessageTypeId: string;
			messageTypeIds: string[];
			scheduledAtDate: string;
			scheduledAtTime: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrderScheduledMessageGroup: PatientOrderScheduledMessageGroup;
		}>({
			method: 'PUT',
			url: `/patient-order-scheduled-message-groups/${patientOrderScheduledMessageGroupId}`,
			data,
		});
	},
	deleteMessage(patientOrderScheduledMessageGroupId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrderScheduledMessageGroup: PatientOrderScheduledMessageGroup;
		}>({
			method: 'DELETE',
			url: `/patient-order-scheduled-message-groups/${patientOrderScheduledMessageGroupId}`,
		});
	},
	updateResourcingStatus(
		patientOrderId: string,
		data: {
			patientOrderResourcingStatusId: PatientOrderResourcingStatusId;
			patientOrderResourcingTypeId?: PatientOrderResourcingTypeId;
			resourcesSentAtDate?: string;
			resourcesSentAtTime?: string;
			resourcesSentNote?: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/patient-order-resourcing-status`,
			data,
		});
	},
	updateSafetyPlanningStatus(
		patientOrderId: string,
		data: {
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/patient-order-safety-planning-status`,
			data,
		});
	},
	overrideTriage(
		patientOrderId: string,
		data: {
			patientOrderTriages: {
				patientOrderFocusTypeId: string;
				patientOrderCareTypeId: string;
				reason: string;
			}[];
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/patient-order-triages`,
			data,
		});
	},
	revertTriage(patientOrderId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/reset-patient-order-triages`,
		});
	},
	scheduleAssessment(data: {
		scheduledDate: string;
		scheduledTime: string;
		patientOrderId: string;
		calendarUrl?: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			patientOrderScheduledScreening: PatientOrderScheduledScreening;
		}>({
			method: 'POST',
			url: '/patient-order-scheduled-screenings',
			data,
		});
	},
	updateScheduledAssessment(
		patientOrderScheduledScreeningId: string,
		data: {
			scheduledDate: string;
			scheduledTime: string;
			calendarUrl?: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrderScheduledScreening: PatientOrderScheduledScreening;
		}>({
			method: 'PUT',
			url: `/patient-order-scheduled-screenings/${patientOrderScheduledScreeningId}`,
			data,
		});
	},
	deleteScheduledAssessment(patientOrderScheduledScreeningId: string) {
		return httpSingleton.orchestrateRequest({
			method: 'DELETE',
			url: `/patient-order-scheduled-screenings/${patientOrderScheduledScreeningId}`,
		});
	},
	getOverview(data?: { panelAccountId?: string }) {
		return httpSingleton.orchestrateRequest<MhicPanelTodayResponse>({
			method: 'GET',
			url: '/integrated-care/panel-today',
			data,
		});
	},
	updatePatientOrderConsentStatus(
		patientOrderId: string,
		data: { patientOrderConsentStatusId: PatientOrderConsentStatusId }
	) {
		return httpSingleton.orchestrateRequest<{ patientOrder: PatientOrderModel }>({
			method: 'PUT',
			url: `/patient-orders/${patientOrderId}/consent-status`,
			data,
		});
	},
	createVoicemailTask(data: { patientOrderId: string; panelAccountId: string; message: string }) {
		return httpSingleton.orchestrateRequest({
			method: 'POST',
			url: '/patient-order-voicemail-tasks',
			data,
		});
	},
	updateVoicemailTask(patientOrderVoicemailTaskId: string, data: { panelAccountId: string; message: string }) {
		return httpSingleton.orchestrateRequest({
			method: 'PUT',
			url: `/patient-order-voicemail-tasks/${patientOrderVoicemailTaskId}`,
			data,
		});
	},
	completeVoicemailTask(patientOrderVoicemailTaskId: string) {
		return httpSingleton.orchestrateRequest({
			method: 'POST',
			url: `/patient-order-voicemail-tasks/${patientOrderVoicemailTaskId}/complete`,
			data: {},
		});
	},
	getLatestPatientOrder() {
		return httpSingleton.orchestrateRequest<LatestPatientOrderResponse>({
			method: 'GET',
			url: '/patient-orders/latest',
		});
	},
	updatePatientOrderResourceCheckInResponseStatusId(
		patientOrderId: string,
		data: { patientOrderResourceCheckInResponseStatusId: PatientOrderResourceCheckInResponseStatusId }
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'PUT',
			url: `patient-orders/${patientOrderId}/patient-order-resource-check-in-response-status`,
			data,
		});
	},
	getClinicalReport(patientOrderId: string) {
		return httpSingleton.orchestrateRequest<{
			clinicalReport: string;
		}>({
			method: 'GET',
			url: `/patient-orders/${patientOrderId}/clinical-report`,
		});
	},
};
