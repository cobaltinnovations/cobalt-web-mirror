export interface CourseModel {
	courseId: string;
	title: string;
	description: string;
	focus?: string;
	imageUrl: string;
	urlName: string;

	// Additional fields for detail view
	courseModules: CourseModuleModel[];
	videos: void[];
	currentCourseSession: CourseSessionModel;
}

export interface CourseModuleModel {
	courseModuleId: string;
	courseId: string;
	title: string;
	estimatedCompletionTimeInMinutes: number;
	estimatedCompletionTimeInMinutesDescription: string;
	courseUnits: CourseUnitModel[];
}

export interface CourseUnitModel {
	courseUnitId: string;
	courseUnitTypeId: CourseUnitTypeId;
	courseModuleId: string;
	title: string;
	description?: string;
	videoId?: string;
	screeningFlowId?: string;
	imageUrl?: string;
}

export interface CourseSessionModel {
	courseSessionId: string;
	courseId: string;
	accountId: string;
	courseSessionStatusId: CourseSessionStatusId;
}

export enum CourseUnitTypeId {}

export enum CourseSessionStatusId {
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELED = 'CANCELED',
}
