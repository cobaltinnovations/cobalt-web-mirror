import { random, range } from 'lodash';
import moment from 'moment';

export interface AdminAnalyticsWidgetChartData {
	label: string;
	count: number;
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
	widgetTypeId: 'counter';
	widgetTotal: string;
}

export interface AdminAnalyticsChartWidget extends BaseAdminAnalyticsWidget {
	widgetTypeId: 'bar-chart' | 'pie-chart';
	widgetTotal: string;
	widgetChartLabel: string;
	widgetData: AdminAnalyticsWidgetChartData[];
}

export interface AdminAnalyticsTableWidget extends BaseAdminAnalyticsWidget {
	widgetTypeId: 'table';
	widgetData: AdminAnalyticsWidgetTableData;
}

export type AdminAnalyticsWidget = AdminAnalyticsCounterWidget | AdminAnalyticsChartWidget | AdminAnalyticsTableWidget;

export function isCounterWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsCounterWidget {
	return widget.widgetTypeId === 'counter';
}

export function isChartWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsChartWidget {
	return widget.widgetTypeId === 'bar-chart' || widget.widgetTypeId === 'pie-chart';
}

export function isTableWidget(widget: AdminAnalyticsWidget): widget is AdminAnalyticsTableWidget {
	return widget.widgetTypeId === 'table';
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
		return {
			fetch: () =>
				Promise.resolve({
					analyticsWidgetGroups: [
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_VISTS',
									widgetTitle: 'Visits',
									widgetTotal: '5,900,510.00',
									widgetSubtitle: 'Total',
									widgetTypeId: 'pie-chart',
									widgetChartLabel: 'Visits',
									widgetData: [
										{
											label: 'New',
											count: random(100, 10000),
											color: '#30578E',
										},
										{
											label: 'Returning',
											count: random(100, 10000),
											color: '#C3D0EB',
										},
									],
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_USERS',
									widgetTitle: 'Users',
									widgetTotal: '5,900,510.00',
									widgetSubtitle: 'Total',
									widgetTypeId: 'pie-chart',
									widgetChartLabel: 'Users',
									widgetData: [
										{
											label: 'Logged In',
											count: random(100, 10000),
											color: '#30578E',
										},
										{
											label: 'Anonymous',
											count: random(100, 10000),
											color: '#C3D0EB',
										},
									],
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_EMPLOYERS',
									widgetTitle: 'Employer',
									widgetTotal: '5,900,510.00',
									widgetSubtitle: 'Across 4 Employers',
									widgetTypeId: 'pie-chart',
									widgetChartLabel: 'Users',
									widgetData: [
										{
											label: 'Employer 1',
											count: random(100, 10000),
											color: '#30578E',
										},
										{
											label: 'Employer 2',
											count: random(100, 10000),
											color: '#C3D0EB',
										},
										{
											label: 'Employer 3',
											count: random(100, 10000),
											color: '#7A97CE',
										},
										{
											label: 'Employer 4',
											count: random(100, 10000),
											color: '#20406C',
										},
									],
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_PAGEVIEWS',
									widgetTitle: 'Pageviews',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Section', 'Views', 'Users', 'Active Users'],
										rows: [
											{
												data: ['Sign In', '1,000,000', '500,000', '250,000'],
											},
											{
												data: ['Home Page', '1,000,000', '500,000', '250,000'],
											},
											{
												data: ['Therapy', '1,000,000', '500,000', '250,000'],
											},
											{
												data: ['CFA', '1,000,000', '500,000', '250,000'],
											},
											{
												data: ['Resource Library', '1,000,000', '500,000', '250,000'],
											},
											{
												data: ['Group Sessions', '1,000,000', '500,000', '250,000'],
											},
										],
									},
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_USER_REFERRALS',
									widgetTitle: 'Users from Referrals',
									widgetTotal: '5,900,510.00',
									widgetSubtitle: '100% of Total',
									widgetTypeId: 'bar-chart',
									widgetChartLabel: 'New Users',
									widgetData: [
										{
											label: 'Direct',
											count: random(100, 10000),
											color: '#E56F65',
										},
										{
											label: 'Referral',
											count: random(100, 10000),
											color: '#F2AD74',
										},
										{
											label: 'Organic Search',
											count: random(100, 10000),
											color: '#81B2B1',
										},
										{
											label: 'Organic Social',
											count: random(100, 10000),
											color: '#F2C87E',
										},
										{
											label: 'Unassigned',
											count: random(100, 10000),
											color: '#7A97CE',
										},
									],
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_REFERRING_DOMAINS',
									widgetTitle: 'Referring Domains',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Domain', 'Users'],
										rows: range(1, 10).map((i) => ({
											data: [`${i}. Domain Name`, '1,000,000'],
										})),
									},
								},
							],
						},
					],
				}),
		};
	},

	getAssessmentsAndAppointments(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return {
			fetch: () =>
				Promise.resolve({
					analyticsWidgetGroups: [
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_CLINICAL_ASSESSMENT_COMPLETION',
									widgetTitle: 'Clinical Assessment Completion',
									widgetTotal: '25%',
									widgetSubtitle: 'Completion Rate',
									widgetTypeId: 'bar-chart',
									widgetChartLabel: 'Assessments',
									widgetData: [
										{
											label: 'Started',
											count: random(100, 10000),
											color: '#EE934E',
										},
										{
											label: 'Phone #s collected',
											count: random(100, 10000),
											color: '#EE934E',
										},
										{
											label: 'Completed',
											count: random(100, 10000),
											color: '#EE934E',
										},
									],
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_CLINICAL_ASSESSMENT_SEVERITY',
									widgetTitle: 'Clinical Assessment Severity',
									widgetTotal: '1,150',
									widgetSubtitle: 'Completed Assessments',
									widgetTypeId: 'bar-chart',
									widgetChartLabel: 'Assessments',
									widgetData: [
										{
											label: 'Mild',
											count: random(100, 10000),
											color: '#81B2B1',
										},
										{
											label: 'Moderate',
											count: random(100, 10000),
											color: '#F0B756',
										},
										{
											label: 'Severe',
											count: random(100, 10000),
											color: '#E56F65',
										},
									],
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_CRISIS_TRIGGERS',
									widgetTitle: 'Crisis Triggers',
									widgetTotal: '1,150',
									widgetSubtitle: 'Total',
									widgetTypeId: 'bar-chart',
									widgetChartLabel: 'Times Triggered',
									widgetData: [
										{
											label: 'Home Selection',
											count: random(100, 10000),
											color: '#E56F65',
										},
										{
											label: 'PHQ-9 Flags',
											count: random(100, 10000),
											color: '#E56F65',
										},
										{
											label: 'In Crisis Button',
											count: random(100, 10000),
											color: '#E56F65',
										},
									],
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_APPOINTMENTS_BOOKABLE',
									widgetTitle: 'Appintments - Bookable Online',
									widgetTypeId: 'table',
									widgetData: {
										headers: [
											'Provider Type',
											'Available Appointments',
											'Booked Appointments',
											'Cancelled Appointments',
											'% of Appts Booked & Kept',
										],
										rows: range(1, 6).map(() => ({
											data: ['Provider Type Name', '1,000', '1,000', '1,000', '100%'],
										})),
									},
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_APPOINTMENTS_CLICK_TO_CALL',
									widgetTitle: 'Appintments - Click to Call',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Provider Type', '# of Clicks to Calls'],
										rows: range(1, 3).map(() => ({
											data: ['Provider Type Name', '1,000'],
										})),
									},
								},
							],
						},
					],
				}),
		};
	},

	getGroupSessions(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return {
			fetch: () =>
				Promise.resolve({
					analyticsWidgetGroups: [
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_GROUP_SESSION_REGISTRATIONS',
									widgetTitle: 'Registrations',
									widgetTotal: '100',
									widgetSubtitle: 'Total',
									widgetTypeId: 'counter',
								},
								{
									widgetReportId: 'ADMIN_ANALYTICS_GROUP_SESSION_REQUESTS',
									widgetTitle: 'Requests',
									widgetTotal: '100',
									widgetSubtitle: 'Total',
									widgetTypeId: 'counter',
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_GROUP_SESSIONS',
									widgetTitle: 'Group Sessions',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Session Title', 'Date Scheduled', 'Views', 'Registrations'],
										rows: range(1, 6).map(() => ({
											data: ['Group Session Title', '00/00/0000', '1,000', '1,000'],
										})),
									},
								},
							],
						},
					],
				}),
		};
	},

	getResourcesAndTopics(params: AdminAnalyticsWidgetsRequestParams): {
		fetch(): Promise<AdminAnalyticsWidgetsResponse>;
	} {
		return {
			fetch: () =>
				Promise.resolve({
					analyticsWidgetGroups: [
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_PAGEVIEWS_RESOURCE_TOPIC',
									widgetTitle: 'Pageview by Resource Topic',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Topic', 'Pageviews'],
										rows: range(1, 6).map(() => ({
											data: ['Topic Name', '1,000'],
											nestedRows: range(1, 6).map(() => {
												return {
													data: ['Subtopic Name', '1,000'],
												};
											}),
										})),
									},
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_RESOURCE_PAGEVIEWS',
									widgetTitle: 'Resource Detail Pageviews (Top 25)',
									widgetTypeId: 'table',
									widgetData: {
										headers: ['Content Title', 'Views'],
										rows: range(1, 25).map(() => ({
											data: ['Title Text', '1,000'],
										})),
									},
								},
							],
						},
						{
							widgets: [
								{
									widgetReportId: 'ADMIN_ANALYTICS_TOPIC_CENTER_OVERVIEW',
									widgetTitle: 'Topic Center Overview',
									widgetTypeId: 'table',
									widgetData: {
										headers: [
											'Topic Center Title',
											'Pageviews',
											'Unique Visitors',
											'Group Session Registrations',
											'Group Session Requests',
											'Community Connection Clicks',
											'Food for Thought Clicks',
										],
										rows: range(1, 3).map(() => ({
											data: [
												'Topic Center Title',
												'1000',
												'1000',
												'1000',
												'1000',
												'1000',
												'1000',
											],
										})),
									},
								},
							],
						},
					],
				}),
		};
	},
};
