import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import { AccountModel, PatientOrderCountModel, PatientOrderModel } from '@/lib/models';

export const integratedCareService = {
	importPatientOrders(data: { csvContent: string }) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: '/patient-order-imports',
			data,
		});
	},
	getPatientOrders(queryParameters?: {
		patientOrderPanelTypeId?: string;
		panelAccountId?: string;
		searchQuery?: string;
		pageNumber?: string;
		pageSize?: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				patientOrders: PatientOrderModel[];
				totalCount: number;
				totalCountDescription: string;
			};
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/patient-orders', queryParameters),
		});
	},
	getPanelAccounts() {
		return httpSingleton.orchestrateRequest<{
			panelAccounts: AccountModel[];
			activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
			overallActivePatientOrderCount: number;
			overallActivePatientOrderCountDescription: string;
		}>({
			method: 'GET',
			url: '/integrated-care/panel-accounts',
		});
	},
	getPatientOverview(patientMrn: string) {
		return httpSingleton.orchestrateRequest<{
			currentPatientOrder: PatientOrderModel;
			pastPatientOrders: PatientOrderModel[];
			patientAccount?: any;
		}>({
			method: 'GET',
			url: `/patients/${patientMrn}/overview`,
		});
	},
};
