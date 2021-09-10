import { httpSingleton } from '@/lib/singletons/http-singleton';
import { CalendarEventGroupsModel } from '@/lib/models/calendar-event-models';

enum REPONSE_FORMAT {
	DEFAULT = 'DEFAULT',
	GROUPED_BY_DATE = 'GROUPED_BY_DATE',
}

interface GetUpcomingCalendarEventsResponseBody {
	calendarEventGroups: CalendarEventGroupsModel[];
}

export const calendarEventsService = {
	getUpcomingCalendarEvents(responseFormat: REPONSE_FORMAT = REPONSE_FORMAT.GROUPED_BY_DATE) {
		return httpSingleton.orchestrateRequest<GetUpcomingCalendarEventsResponseBody>({
			method: 'get',
			url: `/calendar-events/upcoming?responseFormat=${responseFormat}`,
		});
	},
};
