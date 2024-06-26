import { httpSingleton } from '@/lib/singletons/http-singleton';
import { OrchestratedRequest } from '@/lib/http-client';
import { buildQueryParamUrl } from '@/lib/utils';
import { Chart } from '@/lib/models';

interface GetChartsResponse {
	charts: Chart[];
}

interface GetCsvResponse {
	csv: any;
}

export enum REPORTING_WINDOW_ID {
	MONTHLY_ALL_TIME = 'MONTHLY_ALL_TIME',
	MONTHLY_3_MONTHS = 'MONTHLY_3_MONTHS',
	MONTHLY_12_MONTHS = 'MONTHLY_12_MONTHS',
	WEEKLY_4_WEEKS = 'WEEKLY_4_WEEKS',
	WEEKLY_8_WEEKS = 'WEEKLY_8_WEEKS',
	WEEKLY_12_WEEKS = 'WEEKLY_12_WEEKS',
}

export enum ReportTypeId {
	GROUP_SESSION_RESERVATION_EMAILS = 'GROUP_SESSION_RESERVATION_EMAILS',
}

export interface ReportType {
	reportTypeId: string;
	description: string;
}

export const reportingSerive = {
	getCharts(query?: { reportingWindowId?: REPORTING_WINDOW_ID }): OrchestratedRequest<GetChartsResponse> {
		return httpSingleton.orchestrateRequest({
			method: 'GET',
			url: buildQueryParamUrl('/reporting/charts', {
				...(query?.reportingWindowId ? { reportingWindowId: query.reportingWindowId } : {}),
			}),
		});
	},
	getCsv(query?: { reportingWindowId?: REPORTING_WINDOW_ID }): OrchestratedRequest<GetCsvResponse> {
		return httpSingleton.orchestrateRequest({
			method: 'GET',
			url: buildQueryParamUrl('/reporting/csv', {
				...(query?.reportingWindowId ? { reportingWindowId: query.reportingWindowId } : {}),
			}),
		});
	},
	getReportTypes() {
		return httpSingleton.orchestrateRequest<{ reportTypes: ReportType[] }>({
			method: 'GET',
			url: '/reporting/report-types',
		});
	},
};
