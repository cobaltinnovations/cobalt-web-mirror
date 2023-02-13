import React from 'react';
import { Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as SwapIcon } from '@/assets/icons/icon-swap.svg';

const useStyles = createUseThemedStyles((theme) => ({
	accountHeader: {
		padding: '26px 64px',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
}));

export const MhicAccountHeader = () => {
	const classes = useStyles();

	return (
		<header className={classes.accountHeader}>
			<div className="d-flex align-items-center justift-content-between">
				<h3 className="mb-0 me-2">Ava Williams, MHIC</h3>
				<p className="m-0 fs-large text-muted">(76 Patients)</p>
				<Button
					variant="link"
					className="p-2"
					onClick={() => {
						window.alert('[TODO]: Open modal to switch accounts');
					}}
				>
					<SwapIcon />
				</Button>
			</div>
		</header>
	);
};
