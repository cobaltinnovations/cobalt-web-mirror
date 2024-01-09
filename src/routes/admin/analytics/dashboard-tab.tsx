import { AdminAnalyticsWidgetGroup } from '@/components/admin';
import InlineAlert from '@/components/inline-alert';
import Loader from '@/components/loader';
import useHandleError from '@/hooks/use-handle-error';
import {
	AdminAnalyticsWidgetsResponse,
	DATE_OPTION_KEYS,
	adminAnalyticsService,
} from '@/lib/services/admin-analytics-service';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const Component = () => {
	const handleError = useHandleError();
	const dateOptions = useMemo(() => adminAnalyticsService.getDateOptions(), []);

	const { dashboardTab } = useParams<{ dashboardTab: string }>();
	const [searchParams] = useSearchParams();
	const startDate = useMemo(
		() => searchParams.get('startDate') ?? dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].startDate,
		[dateOptions, searchParams]
	);
	const endDate = useMemo(
		() => searchParams.get('endDate') ?? dateOptions[DATE_OPTION_KEYS.LAST_7_DAYS].endDate,
		[dateOptions, searchParams]
	);

	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<AdminAnalyticsWidgetsResponse>();

	useEffect(() => {
		const requestParams = {
			startDate,
			endDate,
		};

		const fetchData = async () => {
			setIsLoading(true);
			let response = undefined;

			try {
				switch (dashboardTab) {
					case 'assessments-and-appointments':
						response = await adminAnalyticsService.getAssessmentsAndAppointments(requestParams).fetch();
						setData(response);
						break;
					case 'group-sessions':
						response = await adminAnalyticsService.getGroupSessions(requestParams).fetch();
						setData(response);
						break;
					case 'resources-and-topics':
						response = await adminAnalyticsService.getResourcesAndTopics(requestParams).fetch();
						setData(response);
						break;
					case 'overview':
					default:
						response = await adminAnalyticsService.getOverview(requestParams).fetch();
						setData(response);
						break;
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [dashboardTab, endDate, handleError, startDate]);

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<>
					{(data?.alerts ?? []).length > 0 && (
						<div className="mb-8">
							{(data?.alerts ?? []).map((alert) => {
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
					{data?.analyticsWidgetGroups.map((group, index) => {
						return <AdminAnalyticsWidgetGroup key={index} widgets={group.widgets} className="mb-10" />;
					})}
				</>
			)}
		</>
	);
};
