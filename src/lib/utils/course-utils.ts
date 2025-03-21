import { CourseSessionModel, CourseUnitLockTypeId } from '../models';

export const getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession = (courseSession: CourseSessionModel) => {
	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([_k, v]) => v.courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED)
		.map(([k, _v]) => k);
	const completedCourseUnitIds = Object.keys(courseSession.courseSessionUnitStatusIdsByCourseUnitId);
	const unlockedAndIncompleteUnitIds = unlockedCourseUnitIds.filter((uid) => !completedCourseUnitIds.includes(uid));
	const firstUnlockedAndIncompleteCourseUnitId = unlockedAndIncompleteUnitIds[0];

	if (firstUnlockedAndIncompleteCourseUnitId) {
		return firstUnlockedAndIncompleteCourseUnitId;
	}

	return '';
};
