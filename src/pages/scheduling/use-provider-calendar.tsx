import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { ProviderCalendar } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import { AxiosError } from 'axios';
import Color from 'color';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useProviderCalendar = ({
	providerId,
	startDate,
	endDate,
}: Partial<{ providerId: string; startDate: string; endDate: string }>) => {
	const handleError = useHandleError();
	const inFlightRequest = useRef<ReturnType<typeof schedulingService['getCalendar']>>();
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

	const fetchData = useCallback(async () => {
		try {
			if (!providerId || !startDate || !endDate) {
				throw new Error('missing Calendar parameters');
			}

			inFlightRequest.current?.abort();

			inFlightRequest.current = schedulingService.getCalendar(providerId, {
				startDate,
				endDate,
			});

			const { providerCalendar } = await inFlightRequest.current.fetch();

			setCalendarEvents(mapCalendarEvents(providerCalendar));
		} catch (error) {
			if ((error as AxiosError).code !== ERROR_CODES.REQUEST_ABORTED) {
				handleError(error);
			}
		}
	}, [providerId, startDate, endDate, handleError]);

	useEffect(() => {
		fetchData();

		return () => {
			inFlightRequest.current?.abort();
		};
	}, [fetchData]);

	return {
		fetchData,
		calendarEvents,
		inFlightRequest,
	};
};

function mapCalendarEvents(calendar: ProviderCalendar) {
	const formattedAvailabilities = calendar.availabilities.map((availability, index) => {
		return {
			id: `availability${index}`,
			start: availability.startDateTime,
			end: availability.endDateTime,
			display: 'background',
			extendedProps: {
				logicalAvailabilityId: availability.logicalAvailabilityId,
				isAvailability: true,
			},
		};
	});

	const formattedBlockedTimes = calendar.blocks.map((availability, index) => {
		return {
			id: `blockedTime${index}`,
			start: availability.startDateTime,
			end: availability.endDateTime,
			display: 'background',
			extendedProps: {
				logicalAvailabilityId: availability.logicalAvailabilityId,
				isBlockedTime: true,
			},
		};
	});

	const formattedAppointments = calendar.appointments.map((appointment, index) => {
		return {
			id: `appointment${index}`,
			title: appointment.account?.displayName || 'Anonymous',
			start: moment(appointment.startTime).toDate(),
			end: moment(appointment.endTime).toDate(),
			backgroundColor: Color(appointment.appointmentType.hexColor).lighten(0.7).hex(),
			borderColor: appointment.appointmentType.hexColor,
			textColor: '#21312A',
			extendedProps: {
				appointmentId: appointment.appointmentId,
			},
		};
	});

	// [TODO]: MAKE THIS REAL
	const formattedFollowUps = calendar.followups.map((followup, index) => {
		return {
			id: `followups${index}`,
			allDay: true,
			title: 'X followups',
			start: moment().toDate(),
			extendedProps: {
				patients: [
					{
						id: 'f1p1',
						name: 'Patient 1',
						phone: '(333) 333-3333',
					},
					{
						id: 'f1p2',
						name: 'Patient 2',
						phone: '(333) 333-3333',
					},
					{
						id: 'f1p3',
						name: 'Patient 3',
						phone: '(333) 333-3333',
					},
				],
			},
		};
	});

	return [...formattedFollowUps, ...formattedAppointments, ...formattedAvailabilities, ...formattedBlockedTimes];
}
