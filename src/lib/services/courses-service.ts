import { httpSingleton } from '@/lib/singletons/http-singleton';
import { CourseModel } from '@/lib/models';

export const coursesService = {
	getCourses() {
		return httpSingleton.orchestrateRequest<{ courses: CourseModel[] }>({
			method: 'get',
			url: '/courses',
		});
	},
};
