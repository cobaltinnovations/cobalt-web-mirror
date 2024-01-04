import { AdminAnalyticsWidgetGroup } from '@/components/admin';
import InlineAlert from '@/components/inline-alert';
import {
	AdminAnalyticsWidgetsRequestParams,
	AdminAnalyticsWidgetsResponse,
	adminAnalyticsService,
} from '@/lib/services/admin-analytics-service';
import React from 'react';
import { Await, LoaderFunctionArgs, defer, redirect, useRouteLoaderData } from 'react-router-dom';

interface AdminAnalyticsDashboardTabLoaderData {
	analyticsWidgetsResponsePromise: Promise<AdminAnalyticsWidgetsResponse>;
}

export function useAdminAnalyticsDashboardTabLoaderData() {
	return useRouteLoaderData('admin-analytics-dashboard-tab') as AdminAnalyticsDashboardTabLoaderData;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const dateOptions = adminAnalyticsService.getDateOptions();
	const startDate = url.searchParams.get('startDate') ?? dateOptions[0].startDate;
	const endDate = url.searchParams.get('endDate') ?? dateOptions[0].endDate;

	const requestParams: AdminAnalyticsWidgetsRequestParams = {
		startDate,
		endDate,
	};

	let analyticsWidgetsResponsePromise: Promise<AdminAnalyticsWidgetsResponse>;

	switch (params.dashboardTab) {
		case 'overview':
			analyticsWidgetsResponsePromise = adminAnalyticsService.getOverview(requestParams).fetch();
			break;

		case 'assessments-and-appointments':
			analyticsWidgetsResponsePromise = adminAnalyticsService
				.getAssessmentsAndAppointments(requestParams)
				.fetch();
			break;

		case 'group-sessions':
			analyticsWidgetsResponsePromise = adminAnalyticsService.getGroupSessions(requestParams).fetch();
			break;

		case 'resources-and-topics':
			analyticsWidgetsResponsePromise = adminAnalyticsService.getResourcesAndTopics(requestParams).fetch();
			break;

		default:
			return redirect('/admin/analytics/overview');
	}

	return defer({
		analyticsWidgetsResponsePromise,
	});
}

export const Component = () => {
	const { analyticsWidgetsResponsePromise } = useAdminAnalyticsDashboardTabLoaderData();

	return (
		<Await resolve={analyticsWidgetsResponsePromise}>
			{(data: AdminAnalyticsWidgetsResponse) => {
				return (
					<>
						{(data.alerts ?? []).length > 0 && (
							<div className="mb-8">
								{(data.alerts ?? []).map((alert) => {
									return (
										<InlineAlert
											variant="warning"
											className="mb-2"
											title={alert.title}
											description={alert.message}
										/>
									);
								})}
							</div>
						)}
						{data.analyticsWidgetGroups.map((group, index) => {
							return <AdminAnalyticsWidgetGroup key={index} widgets={group.widgets} className="mb-10" />;
						})}
					</>
				);
			}}
		</Await>
	);
};
