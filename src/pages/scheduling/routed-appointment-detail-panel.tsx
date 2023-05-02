import classNames from 'classnames';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppointmentDetailPanel } from './appointment-detail-panel';
import { useContainerStyles } from './use-scheduling-styles';
import { MyScheduleOutletContext } from './my-schedule';

export const RoutedAppointmentDetailPanel = () => {
	const classes = useContainerStyles();
	const navigate = useNavigate();

	const { focusDateOnLoad, setCalendarDate, setFocusDateOnLoad, accountIdForDetailsPanel } =
		useOutletContext() as MyScheduleOutletContext;

	return (
		<div className={classNames('px-5 h-100', classes.sideBar)}>
			<AppointmentDetailPanel
				focusDateOnLoad={focusDateOnLoad}
				setCalendarDate={setCalendarDate}
				onAddAppointment={() => {
					navigate(`/scheduling/appointments/new-appointment`);
				}}
				onClose={() => {
					setFocusDateOnLoad(true);
					navigate(`/scheduling`);
				}}
				accountId={accountIdForDetailsPanel}
			/>
		</div>
	);
};
