import { GroupEvent, ExternalGroupEventType, GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';

interface GroupEventsResponse {
	groupEvents: GroupEvent[];
}

interface GroupEventResponse {
	groupEvent: GroupEvent;
}

interface ExternalGroupEventTypesResponse {
	externalGroupEventTypes: ExternalGroupEventType[];
}

interface ExternalGroupEventTypeResponse {
	externalGroupEventType: ExternalGroupEventType;
}

export const groupEventService = {
	isEventExternal(
		event: GroupEvent | ExternalGroupEventType | GroupSessionModel | GroupSessionRequestModel
	): event is ExternalGroupEventType {
		return typeof (event as ExternalGroupEventType).externalGroupEventTypeId !== 'undefined';
	},

	fetchGroupEvents({ urlName }: { urlName?: string }) {
		const params = new URLSearchParams();

		if (urlName) {
			params.set('class', urlName);
		}

		return httpSingleton.orchestrateRequest<GroupEventsResponse>({
			method: 'get',
			url: `/group-events?${params.toString()}`,
		});
	},

	fetchGroupEvent(id: string) {
		return httpSingleton.orchestrateRequest<GroupEventResponse>({
			method: 'get',
			url: `/group-events/${id}`,
		});
	},

	fetchExternalGroupEventTypes({ urlName }: { urlName?: string }) {
		const params = new URLSearchParams();

		if (urlName) {
			params.set('class', urlName);
		}

		return httpSingleton.orchestrateRequest<ExternalGroupEventTypesResponse>({
			method: 'get',
			url: `/external-group-event-types?${params.toString()}`,
		});
	},

	fetchExternalGroupEventType(id: string) {
		return httpSingleton.orchestrateRequest<ExternalGroupEventTypeResponse>({
			method: 'get',
			url: `/external-group-event-types/${id}`,
		});
	},
};
