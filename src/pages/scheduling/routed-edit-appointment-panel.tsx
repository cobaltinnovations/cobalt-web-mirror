import classNames from 'classnames';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { EditAppointmentPanel } from './edit-appointment-panel';
import { MyScheduleOutletContext } from './my-schedule';
import { useContainerStyles } from './use-scheduling-styles';

export const RoutedEditAppointmentPanel = () => {
	const classes = useContainerStyles();
	const navigate = useNavigate();

	const { focusDateOnLoad, setCalendarDate, setFocusDateOnLoad, fetchMainData, fetchLeftData } =
		useOutletContext() as MyScheduleOutletContext;

	return (
		<div className={classNames('px-5 h-100', classes.sideBar)}>
			<EditAppointmentPanel
				focusDateOnLoad={focusDateOnLoad}
				setCalendarDate={setCalendarDate}
				onClose={(updatedAppointmentId) => {
					setFocusDateOnLoad(false);
					if (updatedAppointmentId) {
						navigate(`appointments/${updatedAppointmentId}`);
					} else {
						navigate(``);
					}

					fetchMainData();
					fetchLeftData();
				}}
			/>
		</div>
	);
};
