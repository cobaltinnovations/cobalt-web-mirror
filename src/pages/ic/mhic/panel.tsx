import React from 'react';
import classNames from 'classnames';

import { MhicAccountHeader, MhicNavigation } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { Button } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	row: {
		padding: '0 64px',
	},
}));

const MhicPanel = () => {
	const classes = useStyles();

	return (
		<>
			<MhicAccountHeader />
			<MhicNavigation />
			<div className={classNames(classes.row, 'py-6 d-flex align-items-center justify-content-between')}>
				<Button
					variant="light"
					onClick={() => {
						window.alert('[TODO]: Open filter modal');
					}}
				>
					Filter
				</Button>
				<Button
					variant="light"
					onClick={() => {
						window.alert('[TODO]: Open customization modal');
					}}
				>
					Customize View
				</Button>
			</div>
			<div className={classNames(classes.row)}>table here</div>
		</>
	);
};

export default MhicPanel;
