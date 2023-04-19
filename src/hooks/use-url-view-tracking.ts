import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { useAppRootLoaderData } from '@/routes/root';
import { AcivityTypeId, ActivityActionId } from '@/lib/models';
import { ActivityTrackingContext, activityTrackingService } from '@/lib/services';

import useAccount from './use-account';

const TRACKED_PATHS = ['/sign-in', '/connect-with-support'];

export default function useUrlViewTracking(): void {
	const { isTrackedSession } = useAppRootLoaderData();

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
