export interface CourseModel {
	courseId: string;
	title: string;
	description: string;
	focus?: string;
	imageUrl: string;
	urlName: string;
	courseModules: CourseModuleModel[];
	videos: void[];
	defaultCourseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
	currentCourseSession?: CourseSessionModel;
}

export type CourseUnitLockStatusesByCourseUnitId = Record<
	string,
	{
		courseUnitLockTypeId: CourseUnitLockTypeId;
		determinantCourseUnitIdsByDependencyTypeIds: Record<CourseUnitDependencyTypeId, string[]>;
	}
>;

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
	courseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
}

export enum CourseUnitTypeId {}

export enum CourseSessionStatusId {
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELED = 'CANCELED',
}

export enum CourseUnitDependencyTypeId {
	WEAK = 'WEAK',
	STRONG = 'STRONG',
}

export enum CourseUnitLockTypeId {
	UNLOCKED = 'UNLOCKED',
	WEAKLY_LOCKED = 'WEAKLY_LOCKED',
	STRONGLY_LOCKED = 'STRONGLY_LOCKED',
}
