import { Clinic } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';

export const clinicService = {
	getClinicByClinicId(clinicId: string) {
		return httpSingleton.orchestrateRequest<{ clinic: Clinic }>({
			method: 'get',
			url: `/clinics/${clinicId}`,
		});
	},
};
