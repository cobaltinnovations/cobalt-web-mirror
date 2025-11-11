import React, { PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	customRowButton: {
		zIndex: 0,
		display: 'flex',
		borderRadius: 16,
		overflow: 'hidden',
		position: 'relative',
		border: `1px solid ${theme.colors.border}`,
		'& .overlay': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 1,
			opacity: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-around',
			position: 'absolute',
			transition: '0.3s opacity',
			backgroundColor: 'rgba(0, 0, 0, 0.6)',
		},
		'&:hover .overlay': {
			opacity: 1,
		},
		'& .children-outer img': {
			maxWidth: '100%',
			transform: 'scale(1.01)',
		},
	},
}));

interface PremadeComponentRowButtonProps {
	title: string;
	className?: string;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const PremadeComponentRowButton = ({
	title,
	className,
	onClick,
	children,
}: PropsWithChildren<PremadeComponentRowButtonProps>) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.customRowButton, className)}>
			<div className="overlay">
				<Button onClick={onClick}>{title}</Button>
			</div>
			<div className="children-outer">{children}</div>
		</div>
	);
};
