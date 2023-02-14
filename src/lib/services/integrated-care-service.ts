import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import { AccountModel } from '@/lib/models';

export const integratedCareService = {
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
			activePatientOrderCountsByPanelAccountId: Record<
				string,
				{
					activePatientOrderCount: number;
					activePatientOrderCountDescription: string;
				}
			>;
			panelAccounts: AccountModel[];
		}>({
			method: 'get',
			url: '/integrated-care/panel-accounts',
		});
	},
};
