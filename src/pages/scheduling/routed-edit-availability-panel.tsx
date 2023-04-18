import classNames from 'classnames';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { EditAvailabilityPanel } from './edit-availability-panel';
import { useContainerStyles } from './use-scheduling-styles';
import { MyScheduleOutletContext } from './my-schedule';

export const RoutedEditAvailabilityPanel = () => {
	const classes = useContainerStyles();
	const navigate = useNavigate();

	const { managingAvailabilities, fetchMainData, fetchLeftData } = useOutletContext() as MyScheduleOutletContext;

	return (
		<div className={classNames('px-5 h-100', classes.sideBar)}>
			<EditAvailabilityPanel
				onClose={(logicalAvailabilityId) => {
					if (managingAvailabilities) {
						navigate(`availabilities`);
					} else if (logicalAvailabilityId) {
						navigate(`availabilities/${logicalAvailabilityId}`);
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
