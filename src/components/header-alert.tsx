import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import SvgIcon from './svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	headerAlert: {
		minHeight: 60,
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
			backgroundColor: theme.colors.w300,
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
	message?: string;
	variant?: 'primary' | 'success' | 'warning' | 'danger';
	dismissable?: boolean;
	onDismiss?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	disabled?: boolean;
	className?: string;
}

const HeaderAlert = ({
	title,
	message,
	variant = 'primary',
	dismissable,
	onDismiss,
	disabled,
	className,
}: HeaderAlertProps) => {
	const classes = useStyles();

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <SvgIcon kit="fas" icon="circle-info" size={20} />,
			success: <SvgIcon kit="fas" icon="circle-check" size={20} />,
			warning: <SvgIcon kit="fas" icon="triangle-exclamation" size={20} />,
			danger: <SvgIcon kit="fas" icon="diamond-exclamation" size={20} />,
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
				{message && <div dangerouslySetInnerHTML={{ __html: message ?? '' }} />}
			</div>
			{dismissable && (
				<div className={classes.buttonOuter}>
					<Button variant="link" onClick={onDismiss} disabled={disabled}>
						<CloseIcon />
					</Button>
				</div>
			)}
		</div>
	);
};

export default HeaderAlert;
