import moment from 'moment';

import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import { InstitutionAlert } from '@/lib/models';

export interface AdminAnalyticsWidgetChartData {
	label: string;
	count: number;
	countDescription: string;
	color: string;
}

interface AdminAnalyticsWidgetTableRow {
	data: string[];
	nestedRows?: AdminAnalyticsWidgetTableRow[];
}

interface AdminAnalyticsWidgetTableData {
	headers: string[];
	rows: AdminAnalyticsWidgetTableRow[];
}

interface BaseAdminAnalyticsWidget {
	widgetReportId?: string;
	widgetTitle: string;
	widgetSubtitle?: string;
}

export interface AdminAnalyticsCounterWidget extends BaseAdminAnalyticsWidget {
	widgetTypeId: 'COUNTER';
	widgetTotal: number;
	widgetTotalDescription: string;
}

export interface AdminAnalyticsChartWidget extends BaseAdminAnalyticsWidget {
	widgetTypeId: 'BAR_CHART' | 'PIE_CHART';
	widgetTotal: number;
	widgetTotalDescription: string;
	widgetChartLabel: string;
	widgetData: AdminAnalyticsWidgetChartData[];
}

export interface AdminAnalyticsTableWidget extends BaseAdminAnalyticsWidget {
	widgetTypeId: 'TABLE';
	widgetData: AdminAnalyticsWidgetTableData;
}

export type AdminAnalyticsWidget = AdminAnalyticsCounterWidget | AdminAnalyticsChartWidget | AdminAnalyticsTableWidget;

export function isCounterWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsCounterWidget {
	return widget.widgetTypeId === 'COUNTER';
}

export function isChartWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsChartWidget {
	return widget.widgetTypeId === 'BAR_CHART' || widget.widgetTypeId === 'PIE_CHART';
}

export function isTableWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsTableWidget {
	return widget.widgetTypeId === 'TABLE';
}

export interface AdminAnalyticsWidgetsRequestParams {
	startDate: string;
	endDate: string;
}

export interface AdminAnalyticsWidgetGroup {
	widgets: AdminAnalyticsWidget[];
}

export interface AdminAnalyticsWidgetsResponse {
	analyticsWidgetGroups: AdminAnalyticsWidgetGroup[];
	alerts: InstitutionAlert[];
}

export enum DATE_OPTION_KEYS {
	YESTERDAY = 'YESTERDAY',
	LAST_WEEK = 'LAST_WEEK',
	LAST_MONTH = 'LAST_MONTH',
	LAST_7_DAYS = 'LAST_7_DAYS',
	LAST_30_DAYS = 'LAST_30_DAYS',
}

interface DateOption {
	dateOptionId: DATE_OPTION_KEYS;
	label: string;
	startDate: string;
	startDateDescription: string;
	endDate: string;
	endDateDescription: string;
}

export const adminAnalyticsService = {
	getDateOptions(): Record<DATE_OPTION_KEYS, DateOption> {
		const today = moment();
		const startOf7DaysAgo = moment().subtract(7, 'days').startOf('day');
		const startOf30DaysAgo = moment().subtract(30, 'days').startOf('day');
		const startOfYesterday = moment().subtract(1, 'days').startOf('day');
		const endOfYesterday = moment().subtract(1, 'days').endOf('day');
		const startOfLastWeek = moment().subtract(1, 'week').startOf('week').startOf('day');
		const endOfLastWeek = moment().subtract(1, 'week').endOf('week').endOf('day');
		const startOfLastMonth = moment().subtract(1, 'month').startOf('month').startOf('day');
		const endOfLastMonth = moment().subtract(1, 'month').endOf('month').endOf('day');

		return {
			[DATE_OPTION_KEYS.YESTERDAY]: {
				dateOptionId: DATE_OPTION_KEYS.YESTERDAY,
				label: 'Yesterday',
				startDate: startOfYesterday.format('YYYY-MM-DD'),
				startDateDescription: startOfYesterday.format('MMM DD, YYYY'),
				endDate: endOfYesterday.format('YYYY-MM-DD'),
				endDateDescription: endOfYesterday.format('MMM DD, YYYY'),
			},
			[DATE_OPTION_KEYS.LAST_WEEK]: {
				dateOptionId: DATE_OPTION_KEYS.LAST_WEEK,
				label: 'Last week',
				startDate: startOfLastWeek.format('YYYY-MM-DD'),
				startDateDescription: startOfLastWeek.format('MMM DD, YYYY'),
				endDate: endOfLastWeek.format('YYYY-MM-DD'),
				endDateDescription: endOfLastWeek.format('MMM DD, YYYY'),
			},
			[DATE_OPTION_KEYS.LAST_MONTH]: {
				dateOptionId: DATE_OPTION_KEYS.LAST_MONTH,
				label: 'Last month',
				startDate: startOfLastMonth.format('YYYY-MM-DD'),
				startDateDescription: startOfLastMonth.format('MMM DD, YYYY'),
				endDate: endOfLastMonth.format('YYYY-MM-DD'),
				endDateDescription: endOfLastMonth.format('MMM DD, YYYY'),
			},
			[DATE_OPTION_KEYS.LAST_7_DAYS]: {
				dateOptionId: DATE_OPTION_KEYS.LAST_7_DAYS,
				label: 'Last 7 days',
				startDate: startOf7DaysAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf7DaysAgo.format('MMM DD, YYYY'),
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: today.format('MMM DD, YYYY'),
			},
			[DATE_OPTION_KEYS.LAST_30_DAYS]: {
				dateOptionId: DATE_OPTION_KEYS.LAST_30_DAYS,
				label: 'Last 30 days',
				startDate: startOf30DaysAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf30DaysAgo.format('MMM DD, YYYY'),
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: today.format('MMM DD, YYYY'),
			},
		};
	},

	getOverview(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return httpSingleton.orchestrateRequest<AdminAnalyticsWidgetsResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/analytics/overview', params),
		});
	},

	getAssessmentsAndAppointments(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return httpSingleton.orchestrateRequest<AdminAnalyticsWidgetsResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/analytics/assessments-appointments', params),
		});
	},

	getGroupSessions(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return httpSingleton.orchestrateRequest<AdminAnalyticsWidgetsResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/analytics/group-sessions', params),
		});
	},

	getResourcesAndTopics(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return httpSingleton.orchestrateRequest<AdminAnalyticsWidgetsResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/analytics/resources-topics', params),
		});
	},
};
