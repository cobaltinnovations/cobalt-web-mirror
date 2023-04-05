import React, { ReactNode, useMemo } from 'react';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

import { ReactComponent as SuccessIcon } from '@/assets/icons/flag-success.svg';
import { ReactComponent as WarningIcon } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as DangerIcon } from '@/assets/icons/flag-danger.svg';

const useStyles = createUseThemedStyles((theme) => ({
	headerAlert: {
		height: 56,
		display: 'flex',
		padding: '0 40px',
		backgroundColor: theme.colors.p500,
		'&--primary': {
			backgroundColor: theme.colors.p500,
			'& svg': {
				color: theme.colors.n0,
			},
		},
		'&--warning': {
			backgroundColor: theme.colors.w500,
			'& svg': {
				color: theme.colors.n900,
			},
		},
		'&--danger': {
			backgroundColor: theme.colors.d500,
			'& svg': {
				color: theme.colors.n0,
			},
		},
	},
	iconOuter: {
		flexShrink: 0,
	},
	messageOuter: {
		flex: 1,
	},
	buttonOuter: {
		flexShrink: 0,
	},
}));

interface HeaderAlertProps {
	variant?: 'primary' | 'warning' | 'danger';
	className?: string;
}

const HeaderAlert = ({ variant = 'primary', className }: HeaderAlertProps) => {
	const classes = useStyles();

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <SuccessIcon width={24} height={24} />,
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
			<div className={classes.messageOuter}>hello</div>
			<div className={classes.buttonOuter}></div>
		</div>
	);
};

export default HeaderAlert;
