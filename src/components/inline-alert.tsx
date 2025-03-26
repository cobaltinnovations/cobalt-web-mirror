import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import { ReactComponent as SuccessIcon } from '@/assets/icons/flag-success.svg';
import { ReactComponent as WarningIcon } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as DangerIcon } from '@/assets/icons/icon-flag.svg';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';
import { ReactComponent as FlagDangerIcon } from '@/assets/icons/flag-danger.svg';

const useStyles = createUseThemedStyles((theme) => ({
	inlineAlert: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.border}`,
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
		'&--danger, &--flag-danger': {
			backgroundColor: theme.colors.d50,
			borderColor: theme.colors.d500,
			'& svg': {
				color: theme.colors.d500,
			},
		},
		'&--info': {
			backgroundColor: theme.colors.i50,
			borderColor: theme.colors.i500,
			'& svg': {
				color: theme.colors.i500,
			},
		},
		'&--attention': {
			backgroundColor: theme.colors.t50,
			borderColor: theme.colors.t500,
			'& svg': {
				color: theme.colors.t500,
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

interface InlineAlertAction {
	title: string;
	onClick(): void;
	disabled?: boolean;
}

interface InlineAlertProps {
	variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'attention' | 'flag-danger';
	title: string;
	description?: ReactNode;
	action?: InlineAlertAction | InlineAlertAction[];
	className?: string;
}

export const InlineAlert = ({ title, description, action, variant = 'info', className }: InlineAlertProps) => {
	const classes = useStyles({});

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <InfoIcon width={24} height={24} />,
			success: <SuccessIcon width={24} height={24} />,
			warning: <WarningIcon width={24} height={24} />,
			danger: <DangerIcon width={24} height={24} />,
			info: <InfoIcon width={24} height={24} />,
			attention: <QuestionMarkIcon width={24} height={24} />,
			'flag-danger': <FlagDangerIcon width={24} height={24} />,
		};
	}, []);

	const actionsToRender = useMemo(() => {
		if (!action) {
			return [];
		} else if (Array.isArray(action)) {
			return action;
		} else {
			return [action];
		}
	}, [action]);

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
				<p
					className={classNames('fs-large fw-semibold', {
						'mb-0': !description && !action,
						'mb-2': description || action,
					})}
				>
					{title}
				</p>
				{description && (
					<div
						className={classNames({
							'mb-2': !!action === true,
							'mb-0': !!action === false,
						})}
					>
						{description}
					</div>
				)}
				{actionsToRender.length > 0 && (
					<div>
						{actionsToRender.map((a, actionIndex) => {
							const isLast = actionIndex === actionsToRender.length - 1;

							return (
								<React.Fragment key={actionIndex}>
									<Button variant="link" size="sm" className="p-0 fw-normal" onClick={a.onClick}>
										{a.title}
									</Button>
									{!isLast && <span className="mx-1">&bull;</span>}
								</React.Fragment>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default InlineAlert;
