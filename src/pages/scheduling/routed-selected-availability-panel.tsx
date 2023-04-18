import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectedAvailabilityPanel } from './selected-availability-panel';
import { useContainerStyles } from './use-scheduling-styles';

export const RoutedSelectedAvailabilityPanel = () => {
	const classes = useContainerStyles();
	const navigate = useNavigate();

	return (
		<div className={classNames('px-5 h-100', classes.sideBar)}>
			<SelectedAvailabilityPanel
				onClose={() => {
					navigate(``);
				}}
			/>
		</div>
	);
};
