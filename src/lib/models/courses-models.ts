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
	courseModuleId: string;
	courseUnitId: string;
	courseUnitTypeId: CourseUnitTypeId;
	courseUnitTypeIdDescription: string;
	created: string;
	createdDescription: string;
	description?: string;
	estimatedCompletionTimeInMinutes: number;
	estimatedCompletionTimeInMinutesDescription: string;
	imageUrl?: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	screeningFlowId?: string;
	title: string;
	videoId?: string;
}

export interface CourseSessionModel {
	courseSessionId: string;
	courseId: string;
	accountId: string;
	courseSessionStatusId: CourseSessionStatusId;
	courseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
}

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

export enum CourseUnitTypeId {
	VIDEO = 'VIDEO',
	INFOGRAPHIC = 'INFOGRAPHIC',
	HOMEWORK = 'HOMEWORK',
	CARD_SORT = 'CARD_SORT',
	QUIZ = 'QUIZ',
	REORDER = 'REORDER',
}
