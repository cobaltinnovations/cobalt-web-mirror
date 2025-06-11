import { httpSingleton } from '@/lib/singletons/http-singleton';
import { CourseModel, CourseSessionModel } from '@/lib/models';

export const coursesService = {
	getCourses() {
		return httpSingleton.orchestrateRequest<{ courses: CourseModel[] }>({
			method: 'get',
			url: '/courses',
		});
	},
	getCourseDetail(courseIdentifier: string) {
		return httpSingleton.orchestrateRequest<{ course: CourseModel }>({
			method: 'get',
			url: `/courses/${courseIdentifier}`,
		});
	},
	createCourseSession(data: { courseId: string }) {
		return httpSingleton.orchestrateRequest<{ courseSession: CourseSessionModel }>({
			method: 'post',
			url: `/course-sessions`,
			data,
		});
	},
	completeCourseUnit(courseUnitId: string) {
		return httpSingleton.orchestrateRequest<{ courseSession: CourseSessionModel }>({
			method: 'post',
			url: `/course-units/${courseUnitId}/complete`,
		});
	},
};
