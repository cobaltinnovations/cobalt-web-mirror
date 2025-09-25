import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

const useStyles = createUseThemedStyles((theme) => ({
	noData: {
		padding: 48,
		borderRadius: 4,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.border}`,
	},
}));

export interface NoDataAction {
	size?: 'sm' | 'lg';
	className?: string;
	icon?: JSX.Element;
	variant: ButtonVariant;
	title: string;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	disabled?: boolean;
}

export interface NoDataProps {
	illustration?: ReactElement;
	title: string;
	description?: string | ReactNode;
	actions: NoDataAction[];
	className?: string;
}

const NoData = ({ illustration, title, description, actions, className }: NoDataProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.noData, className)}>
			{illustration && <div className="mb-6 text-center">{illustration}</div>}
			<h4
				className={classNames('text-center', {
					'mb-0': !description && actions.length <= 0,
					'mb-3': description,
					'mb-6': !description && actions.length > 0,
				})}
			>
				{title}
			</h4>
			{description && (
				<div>
					{typeof description === 'string' ? (
						<div
							className={classNames('text-center', {
								'mb-0': actions.length <= 0,
								'mb-6': actions.length > 0,
							})}
							dangerouslySetInnerHTML={{ __html: description ?? '' }}
						/>
					) : (
						description
					)}
				</div>
			)}
			{actions.length > 0 && (
				<div className="d-flex justify-content-center align-items-center">
					{actions.map((action, actionIndex) => (
						<Button
							key={actionIndex}
							size={action.size}
							variant={action.variant}
							className={classNames('mx-1 d-flex align-items-center', action.className)}
							onClick={action.onClick}
							disabled={action.disabled}
						>
							{action.icon}
							{action.title}
						</Button>
					))}
				</div>
			)}
		</div>
	);
};

export default NoData;
