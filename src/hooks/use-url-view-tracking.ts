import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { AcivityTypeId, ActivityActionId } from '@/lib/models';
import { ActivityTrackingContext, activityTrackingService } from '@/lib/services';

import useAccount from './use-account';
import useQuery from './use-query';

const TRACKED_PATHS = ['/connect-with-support']

export default function useUrlViewTracking(): void {
	const { account, initialized, isTrackedSession } = useAccount();
	const query = useQuery();
	const { pathname } = useLocation();

	const accountId = account?.accountId;
	useEffect(() => {
		if (!isTrackedSession || !initialized || !accountId) {
			return;
		}

		if (TRACKED_PATHS.includes(pathname)) {
			const queryParamsKeys = query.keys();
			const queryParamsAsObject: Record<string, string[]> = {};

			for (const key of queryParamsKeys) {
				queryParamsAsObject[key] = query.getAll(key);
			}

			const context: ActivityTrackingContext = {
				pathname,
			};

			if (Object.keys(queryParamsAsObject).length) {
				context.queryParams = queryParamsAsObject;
			}

			activityTrackingService.track({
				activityActionId: ActivityActionId.View,
				activityTypeId: AcivityTypeId.Url,
				context,
			}).fetch();
		}
	}, [pathname, initialized, query, accountId, isTrackedSession]);
}
