import { httpSingleton } from '@/lib/singletons/http-singleton';
import { ActivityTracking, AcivityTypeId, ActivityActionId } from '@/lib/models';
import { OrchestratedRequest } from '@/lib/http-client';

interface ActivityTrackingResponse {
	activityTracking: ActivityTracking;
}

export interface ActivityTrackingContext {
	contentId?: string;
	pathname?: string;
	queryParams?: Record<string, string[]>;
}

interface TrackData {
	activityTypeId: AcivityTypeId;
	activityActionId: ActivityActionId;
	context?: ActivityTrackingContext;
}

export const activityTrackingService = {
	track(data: TrackData): OrchestratedRequest<ActivityTrackingResponse> {
		return httpSingleton.orchestrateRequest<ActivityTrackingResponse>({
			method: 'post',
			url: '/activity-tracking',
			data: {
				...data,
				context: JSON.stringify(data.context),
			},
		});
	},
	trackUnauthenticated(data: TrackData): OrchestratedRequest<ActivityTrackingResponse> {
		return httpSingleton.orchestrateRequest<ActivityTrackingResponse>({
			method: 'post',
			url: '/unauthenticated-activity-tracking',
			data: {
				...data,
				context: JSON.stringify(data.context),
			},
		});
	},
};
