import React from 'react';
import { Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as SwapIcon } from '@/assets/icons/icon-swap.svg';

const useStyles = createUseThemedStyles((theme) => ({
	accountHeader: {
		display: 'flex',
		padding: '26px 64px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
}));

interface MhicAccountHeaderProps {
	onSwitchButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicAccountHeader = ({ onSwitchButtonClick }: MhicAccountHeaderProps) => {
	const classes = useStyles();

	return (
		<header className={classes.accountHeader}>
			<div className="d-flex align-items-center justift-content-between">
				<h3 className="mb-0 me-2">Ava Williams, MHIC</h3>
				<p className="m-0 fs-large text-muted">(76 Patients)</p>
				<Button variant="link" className="p-2" onClick={onSwitchButtonClick}>
					<SwapIcon />
				</Button>
			</div>
			<Button
				onClick={() => {
					window.alert('[TODO]: Import (CSV?)');
				}}
			>
				Import Patients
			</Button>
		</header>
	);
};
