import React from 'react';
import { useContainerStyles } from './use-scheduling-styles';
import classNames from 'classnames';
import { ManageAvailabilityPanel } from './manage-availability-panel';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MyScheduleOutletContext } from './my-schedule';

export const RoutedManageAvailailityPanel = () => {
	const classes = useContainerStyles();
	const navigate = useNavigate();

	const { setManagingAvailabilties } = useOutletContext() as MyScheduleOutletContext;

	return (
		<div className={classNames('px-5 h-100', classes.sideBar)}>
			<ManageAvailabilityPanel
				onClose={() => {
					setManagingAvailabilties(false);
					navigate(``);
				}}
			/>
		</div>
	);
};
