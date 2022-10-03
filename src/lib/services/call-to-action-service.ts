import { httpSingleton } from '@/lib/singletons';
import { CallToActionModel } from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export const callToActionService = {
	getCallsToAction(queryParams?: { callToActionDisplayAreaId?: string }) {
		return httpSingleton.orchestrateRequest<{ callsToAction: CallToActionModel[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/calls-to-action', queryParams),
		});
	},
};
