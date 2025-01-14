import React from 'react';
import { Button } from 'react-bootstrap';
import { MHIC_HEADER_HEIGHT } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

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
	exitButtonOuter: {
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 40px',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	actionSeparator: {
		width: 1,
		height: 32,
		marginRight: 16,
		backgroundColor: theme.colors.border,
	},
	navigationOuter: {
		flex: 1,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
}));

interface MhicFullscreenBarProps {
	showExitButton: boolean;
	title: string;
	primaryAction?: {
		title: string;
		onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	};
	secondaryAction?: {
		title: string;
		onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	};
	tertiaryAction?: {
		title: string;
		onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	};
}

export const MhicFullscreenBar = ({
	showExitButton,
	title,
	primaryAction,
	secondaryAction,
	tertiaryAction,
}: MhicFullscreenBarProps) => {
	const classes = useStyles();
	const navigate = useNavigate();

	return (
		<header className={classes.header}>
			{showExitButton && (
				<div className={classes.exitButtonOuter}>
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
			)}
			<div
				className={classNames(classes.navigationOuter, 'pe-10', {
					'ps-6': showExitButton,
					'ps-10': !showExitButton,
				})}
			>
				<h5 className="mb-0 fw-semibold">{title}</h5>
				<div className="d-flex align-items-center">
					{tertiaryAction && (
						<Button
							variant="link"
							size="sm"
							className="text-decoration-none"
							onClick={tertiaryAction.onClick}
						>
							{tertiaryAction.title}
						</Button>
					)}
					{tertiaryAction && (secondaryAction || primaryAction) && (
						<div className={classes.actionSeparator} />
					)}
					{secondaryAction && (
						<Button
							variant="outline-primary"
							size="sm"
							className={classNames({
								'me-2': primaryAction,
							})}
							onClick={secondaryAction.onClick}
						>
							{secondaryAction.title}
						</Button>
					)}
					{primaryAction && (
						<Button variant="primary" size="sm" onClick={primaryAction.onClick}>
							{primaryAction.title}
						</Button>
					)}
				</div>
			</div>
		</header>
	);
};
