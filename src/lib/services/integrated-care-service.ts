import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	AccountModel,
	OpenPatientOrderCountModel,
	PatientOrderAutocompleteResult,
	PatientOrderClosureReasonModel,
	PatientOrderCountModel,
	PatientOrderModel,
	PatientOrderNoteModel,
	PatientOrderOutreachModel,
	PatientOrderScheduledMessageGroup,
	PatientOrderStatusId,
	ReferenceDataResponse,
} from '@/lib/models';

export interface PatientOrderResponse {
	findResult: {
		patientOrders: PatientOrderModel[];
		totalCount: number;
		totalCountDescription: string;
	};
	activePatientOrdersCount: number;
	activePatientOrdersCountDescription: string;
	activePatientOrderCountsByPatientOrderStatusId: Record<PatientOrderStatusId, PatientOrderCountModel>;
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
}

export enum PatientOrderResponseSupplement {
	MINIMAL = 'MINIMAL',
	PANEL = 'PANEL',
	EVERYTHING = 'EVERYTHING',
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
	getPatientOrders(queryParameters?: {
		patientOrderStatusId?: string | string[];
		panelAccountId?: string;
		patientMrn?: string;
		pageNumber?: string;
		pageSize?: string;
	}) {
		return httpSingleton.orchestrateRequest<PatientOrderResponse>({
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

		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
			associatedPatientOrders: PatientOrderModel[];
			patientAccount?: AccountModel;
		}>({
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
		accountId: string;
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
};
