import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { AcivityTypeId, ActivityActionId } from '@/lib/models';
import { ActivityTrackingContext, activityTrackingService } from '@/lib/services';

import useAccount from './use-account';
import { useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { AppRootLoaderData } from '@/app-root';

const TRACKED_PATHS = ['/sign-in', '/connect-with-support'];

export default function useUrlViewTracking(): void {
	const { isTrackedSession } = useRouteLoaderData('root') as AppRootLoaderData;
	const { account } = useAccount();
	const [searchParams] = useSearchParams();
	const { pathname } = useLocation();

	const accountId = account?.accountId;
	useEffect(() => {
		if (TRACKED_PATHS.some((trackedPath) => pathname.includes(trackedPath))) {
			const queryParamsKeys = searchParams.keys();
			const queryParamsAsObject: Record<string, string[]> = {};

			for (const key of queryParamsKeys) {
				queryParamsAsObject[key] = searchParams.getAll(key);
			}

			const context: ActivityTrackingContext = {
				pathname,
			};

			if (Object.keys(queryParamsAsObject).length) {
				context.queryParams = queryParamsAsObject;
			}

			if (!accountId) {
				activityTrackingService
					.trackUnauthenticated({
						activityActionId: ActivityActionId.View,
						activityTypeId: AcivityTypeId.Url,
						context,
					})
					.fetch();
				return;
			}

			if (!isTrackedSession) {
				return;
			}

			activityTrackingService
				.track({
					activityActionId: ActivityActionId.View,
					activityTypeId: AcivityTypeId.Url,
					context,
				})
				.fetch();
		}
	}, [accountId, isTrackedSession, pathname, searchParams]);
}
