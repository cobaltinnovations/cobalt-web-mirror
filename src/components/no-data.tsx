import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

const useStyles = createUseThemedStyles((theme) => ({
	noData: {
		padding: 48,
		borderRadius: 4,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.n100}`,
	},
}));

interface Props {
	illustration?: ReactElement;
	title: string;
	description?: string;
	actions: {
		variant: ButtonVariant;
		title: string;
		onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	}[];
	className?: string;
}

const NoData = ({ illustration, title, description, actions, className }: Props) => {
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
				<p
					className={classNames('text-center', {
						'mb-0': actions.length <= 0,
						'mb-6': actions.length > 0,
					})}
				>
					{description}
				</p>
			)}
			{actions.length > 0 && (
				<div className="text-center">
					{actions.map((action, actionIndex) => (
						<Button key={actionIndex} variant={action.variant} className="mx-1" onClick={action.onClick}>
							{action.title}
						</Button>
					))}
				</div>
			)}
		</div>
	);
};

export default NoData;
