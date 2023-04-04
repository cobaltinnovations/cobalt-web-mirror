import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as SuccessIcon } from '@/assets/icons/flag-success.svg';
import { ReactComponent as WarningIcon } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as DangerIcon } from '@/assets/icons/icon-flag.svg';

const useStyles = createUseThemedStyles((theme) => ({
	inlineAlert: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.n100}`,
		'&--primary': {
			backgroundColor: theme.colors.p50,
			borderColor: theme.colors.p500,
			'& svg': {
				color: theme.colors.p500,
			},
		},
		'&--secondary': {
			backgroundColor: theme.colors.a50,
			borderColor: theme.colors.a500,
			'& svg': {
				color: theme.colors.a500,
			},
		},
		'&--success': {
			backgroundColor: theme.colors.s50,
			borderColor: theme.colors.s500,
			'& svg': {
				color: theme.colors.s500,
			},
		},
		'&--warning': {
			backgroundColor: theme.colors.w50,
			borderColor: theme.colors.w500,
			'& svg': {
				color: theme.colors.w500,
			},
		},
		'&--danger': {
			backgroundColor: theme.colors.d50,
			borderColor: theme.colors.d500,
			'& svg': {
				color: theme.colors.d500,
			},
		},
	},
	iconOuter: {
		width: 24,
		flexShrink: 0,
		marginRight: 16,
	},
	informationOuter: {
		flex: 1,
	},
}));

interface MhicInlineAlertProps {
	variant?: 'success' | 'warning' | 'danger';
	title: string;
	description?: string;
	action?: {
		title: string;
		onClick(): void;
	};
	className?: string;
}

export const MhicInlineAlert = ({ title, description, action, variant, className }: MhicInlineAlertProps) => {
	const classes = useStyles({});

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			success: <SuccessIcon width={24} height={24} />,
			warning: <WarningIcon width={24} height={24} />,
			danger: <DangerIcon width={24} height={24} />,
		};
	}, []);

	return (
		<div
			className={classNames(
				classes.inlineAlert,
				{
					[`${classes.inlineAlert}--${variant}`]: !!variant,
				},
				className
			)}
		>
			<div className={classes.iconOuter}>{variant && icon[variant]}</div>
			<div className={classes.informationOuter}>
				<p className="mb-2 fs-large fw-bold">{title}</p>
				{description && (
					<p
						className={classNames({
							'mb-2': !!action === true,
							'mb-0': !!action === false,
						})}
					>
						{description}
					</p>
				)}
				{action && (
					<Button variant="link" size="sm" className="p-0 fw-normal" onClick={action.onClick}>
						{action.title}
					</Button>
				)}
			</div>
		</div>
	);
};
