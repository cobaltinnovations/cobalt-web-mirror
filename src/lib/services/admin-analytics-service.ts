import moment from 'moment';

import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';

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
}

export const adminAnalyticsService = {
	getDateOptions() {
		const today = moment();
		const todayFormatted = today.format('MMM DD, YYYY');

		const startOf7DaysAgo = moment().subtract(7, 'days').startOf('day');
		const startOf7DaysAgoFormatted = startOf7DaysAgo.format('MMM DD, YYYY');
		const startOf30DaysAgo = moment().subtract(30, 'days').startOf('day');
		const startOf30DaysAgoFormatted = startOf30DaysAgo.format('MMM DD, YYYY');
		const startOf90DaysAgo = moment().subtract(90, 'days').startOf('day');
		const startOf90DaysAgoFormatted = startOf90DaysAgo.format('MMM DD, YYYY');
		const startOf12MonthsAgo = moment().subtract(12, 'months').startOf('day');
		const startOf12MonthsAgoFormatted = startOf12MonthsAgo.format('MMM DD, YYYY');
		const startOfThisYear = moment().startOf('year').startOf('day');
		const startOfThisYearFormatted = startOfThisYear.format('MMM DD, YYYY');

		return [
			{
				label: 'Last 7 days',
				startDate: startOf7DaysAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf7DaysAgoFormatted,
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: todayFormatted,
			},
			{
				label: 'Last 30 days',
				startDate: startOf30DaysAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf30DaysAgoFormatted,
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: todayFormatted,
			},
			{
				label: 'Last 90 days',
				startDate: startOf90DaysAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf90DaysAgoFormatted,
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: todayFormatted,
			},
			{
				label: 'Last 12 months',
				startDate: startOf12MonthsAgo.format('YYYY-MM-DD'),
				startDateDescription: startOf12MonthsAgoFormatted,
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: todayFormatted,
			},
			{
				label: 'This year',
				startDate: startOfThisYear.format('YYYY-MM-DD'),
				startDateDescription: startOfThisYearFormatted,
				endDate: today.format('YYYY-MM-DD'),
				endDateDescription: todayFormatted,
			},
		];
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
