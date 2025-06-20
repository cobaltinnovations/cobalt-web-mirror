import { Content } from '@/lib/models';

export interface CourseModel {
	courseId: string;
	title: string;
	description: string;
	focus?: string;
	imageUrl: string;
	urlName: string;
	courseModules: CourseModuleModel[];
	videos: CourseVideoModel[];
	defaultCourseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
	currentCourseSession?: CourseSessionModel;
	contents: Content[];
	completionPercentage: number;
}

export type CourseSessionUnitStatusIdsByCourseUnitId = Record<string, CourseSessionUnitStatusId>;

export type CourseUnitLockStatusesByCourseUnitId = Record<string, CourseUnitLockStatus>;
export type CourseUnitLockStatus = {
	courseUnitLockTypeId: CourseUnitLockTypeId;
	determinantCourseUnitIdsByDependencyTypeIds: Record<CourseUnitDependencyTypeId, string[]>;
};

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
	estimatedCompletionTimeInMinutesDescription?: string;
	imageUrl?: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	screeningFlowId?: string;
	title: string;
	videoId?: string;
	completionThresholdInSeconds?: number;
	courseUnitDownloadableFiles: CourseUnitDownloadableFile[];
	unitCompletionTypeId: UnitCompletionTypeId;
	showRestartActivityWhenComplete: boolean;
	showUnitAsComplete: boolean;
}

export interface CourseSessionModel {
	courseSessionId: string;
	courseId: string;
	accountId: string;
	courseSessionStatusId: CourseSessionStatusId;
	courseSessionUnitStatusIdsByCourseUnitId: CourseSessionUnitStatusIdsByCourseUnitId;
	courseUnitLockStatusesByCourseUnitId: CourseUnitLockStatusesByCourseUnitId;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	optionalCourseModuleIds: string[];
	completionPercentageForDisplay: string;
	courseSessionCompletionPercentage: {
		completionPercentage: number;
		courseSessionId: string;
		minutesCompleted: number;
		totalMinutes: number;
	};
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
	THINGS_TO_SHARE = 'THINGS_TO_SHARE',
}

export enum CourseSessionUnitStatusId {
	COMPLETED = 'COMPLETED',
	SKIPPED = 'SKIPPED',
}

export interface CourseVideoModel {
	created: string;
	createdDescription: string;
	kalturaEntryId: string;
	kalturaPartnerId: string;
	kalturaUiconfId: string;
	kalturaWid: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	videoId: string;
	videoVendorId: string;
}

export interface CourseUnitDownloadableFile {
	contentType: string;
	courseUnitDownloadableFileId: string;
	courseUnitId: string;
	displayOrder: 1;
	fileUploadId: string;
	filename: string;
	filesize: number;
	filesizeDescription: string;
	url: string;
}

export enum UnitCompletionTypeId {
	IMMEDIATELY = 'IMMEDIATELY',
	DO_NOT_MARK_COMPLETE = 'DO_NOT_MARK_COMPLETE',
	COMPLETION_THRESHOLD_IN_SECONDS = 'COMPLETION_THRESHOLD_IN_SECONDS',
}
