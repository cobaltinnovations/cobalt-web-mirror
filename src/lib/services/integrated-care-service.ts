import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import { AccountModel, PatientOrderCountModel } from '@/lib/models';

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
				patientOrders: [];
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
			activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
			panelAccounts: AccountModel[];
		}>({
			method: 'GET',
			url: '/integrated-care/panel-accounts',
		});
	},
};
