// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/ActivityType.java#L18
export enum AcivityTypeId {
	Content = 'CONTENT',
	Url = 'URL',
}

// https://github.com/Penn-Medicine-CHCI/cobalt-api/blob/master/src/main/java/com/cobaltplatform/api/model/db/ActivityAction.java#L18
export enum ActivityActionId {
	View = 'VIEW',
	Download = 'DOWNLOAD',
}

export interface ActivityTracking {
	activityTrackingId: string;
	accountId: string;
	activityTypeId: AcivityTypeId;
	activityActionId: ActivityActionId;
	activityKey: string;
	context: string;
}
