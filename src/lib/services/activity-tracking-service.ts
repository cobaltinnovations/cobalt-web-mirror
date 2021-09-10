import { httpSingleton } from '@/lib/singletons/http-singleton';
import { ActivityTracking, AcivityTypeId, ActivityActionId } from '@/lib/models';

interface ActivityTrackingResponse {
	activityTracking: ActivityTracking;
}

interface TrackData {
	activityTypeId: AcivityTypeId;
	activityActionId: ActivityActionId;
	activityKey?: string;
}

export const activityTrackingService = {
	track(data: TrackData) {
		return httpSingleton.orchestrateRequest<ActivityTrackingResponse>({
			method: 'post',
			url: '/activity-tracking',
			data,
		});
	},
};
