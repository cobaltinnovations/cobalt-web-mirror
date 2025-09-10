import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import SvgIcon from './svg-icon';

/* --------------------------------------------------------------- */
/* inline alert styles were moved to the useGlobalStyles hook! */
/* --------------------------------------------------------------- */

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
	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <SvgIcon kit="fas" icon="circle-info" size={20} />,
			success: <SvgIcon kit="fas" icon="circle-check" size={20} />,
			warning: <SvgIcon kit="fas" icon="triangle-exclamation" size={20} />,
			danger: <SvgIcon kit="fas" icon="diamond-exclamation" size={20} />,
			info: <SvgIcon kit="fas" icon="circle-info" size={20} />,
			attention: <SvgIcon kit="fas" icon="circle-question" size={20} />,
			'flag-danger': <SvgIcon kit="fas" icon="flag-pennant" size={20} />,
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
				'inline-alert',
				{
					[`inline-alert--${variant}`]: !!variant,
				},
				className
			)}
		>
			<div className="icon-outer">{variant && icon[variant]}</div>
			<div className="information-outer">
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
