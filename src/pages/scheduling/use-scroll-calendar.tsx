import { AppointmentModel } from '@/lib/models';
import { useEffect } from 'react';

export function useScrollCalendar(
	setCalendarDate: (date: Date, scrollTime?: string) => void,
	focusDateOnLoad: boolean,
	appointment?: AppointmentModel
) {
	const appointmentDate = appointment?.localStartDate;
	const appointmentTime = appointment?.localStartTime;
	useEffect(() => {
		if (!focusDateOnLoad) {
			return;
		}

		if (appointmentDate && appointmentTime) {
			setCalendarDate(new Date(appointmentDate), appointmentTime);
		}
	}, [appointmentDate, appointmentTime, setCalendarDate, focusDateOnLoad]);
}
