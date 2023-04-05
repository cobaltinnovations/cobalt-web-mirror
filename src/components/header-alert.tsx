import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

import { ReactComponent as PrimaryIcon } from '@/assets/icons/flag-primary.svg';
import { ReactComponent as SuccessIcon } from '@/assets/icons/flag-success.svg';
import { ReactComponent as WarningIcon } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as DangerIcon } from '@/assets/icons/flag-danger.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';

const useStyles = createUseThemedStyles((theme) => ({
	headerAlert: {
		display: 'flex',
		alignItems: 'center',
		padding: '10px 40px',
		backgroundColor: theme.colors.p500,
		'&--primary': {
			color: theme.colors.n0,
			backgroundColor: theme.colors.p500,
		},
		'&--success': {
			color: theme.colors.n0,
			backgroundColor: theme.colors.s500,
		},
		'&--warning': {
			color: theme.colors.n900,
			backgroundColor: theme.colors.w500,
		},
		'&--danger': {
			color: theme.colors.n0,
			backgroundColor: theme.colors.d500,
		},
		'& button, & a': {
			color: 'inherit',
			'&:hover': {
				color: 'inherit',
			},
		},
	},
	iconOuter: {
		width: 24,
		flexShrink: 0,
		marginRight: 24,
	},
	messageOuter: {
		flex: 1,
	},
	buttonOuter: {
		width: 24,
		flexShrink: 0,
	},
}));

interface HeaderAlertProps {
	title: string;
	message: string;
	variant?: 'primary' | 'success' | 'warning' | 'danger';
	dismissable?: boolean;
	onDismiss?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	className?: string;
}

const HeaderAlert = ({ title, message, variant = 'primary', dismissable, onDismiss, className }: HeaderAlertProps) => {
	const classes = useStyles();

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <PrimaryIcon width={24} height={24} />,
			success: <SuccessIcon width={24} height={24} />,
			warning: <WarningIcon width={24} height={24} />,
			danger: <DangerIcon width={24} height={24} />,
		};
	}, []);

	return (
		<div
			className={classNames(
				classes.headerAlert,
				{
					[`${classes.headerAlert}--${variant}`]: !!variant,
				},
				className
			)}
		>
			<div className={classes.iconOuter}>{variant && icon[variant]}</div>
			<div className={classes.messageOuter}>
				<div className="fw-bold" dangerouslySetInnerHTML={{ __html: title }} />
				<div dangerouslySetInnerHTML={{ __html: message }} />
			</div>
			{dismissable && (
				<div className={classes.buttonOuter}>
					<Button variant="link" onClick={onDismiss}>
						<CloseIcon />
					</Button>
				</div>
			)}
		</div>
	);
};

export default HeaderAlert;
