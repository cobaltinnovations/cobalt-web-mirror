import React from 'react';
import { Button } from 'react-bootstrap';
import { MHIC_HEADER_HEIGHT } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { useNavigate } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: MHIC_HEADER_HEIGHT,
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	brandingOuter: {
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 40px',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	navigationOuter: {
		flex: 1,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		padding: '0 40px 0 24px',
		justifyContent: 'space-between',
	},
}));

interface MhicCareResourceFormHeaderProps {
	onAddLocationButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicCareResourceFormHeader = ({ onAddLocationButtonClick }: MhicCareResourceFormHeaderProps) => {
	const classes = useStyles();
	const navigate = useNavigate();

	return (
		<header className={classes.header}>
			<div className={classes.brandingOuter}>
				<Button
					type="button"
					variant="link"
					className="text-decoration-none text-gray fw-normal"
					onClick={() => {
						navigate(-1);
					}}
				>
					Exit
				</Button>
			</div>
			<div className={classes.navigationOuter}>
				<h5 className="mb-0 fw-semibold">Add Resource Location</h5>
				<Button variant="primary" size="sm" onClick={onAddLocationButtonClick}>
					Add Location
				</Button>
			</div>
		</header>
	);
};
