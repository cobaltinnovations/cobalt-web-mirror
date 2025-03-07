import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ImageIcon } from '@/assets/icons/icon-image.svg';

const useStyles = createUseThemedStyles((theme) => ({
	customRowButton: {
		zIndex: 0,
		display: 'flex',
		borderRadius: 16,
		overflow: 'hidden',
		padding: '16px 8px',
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
	},
	column: {
		flex: 1,
		margin: '0 8px',
	},
	image: {
		height: 72,
		width: '100%',
		display: 'flex',
		borderRadius: 4,
		marginBottom: 16,
		alignItems: 'center',
		justifyContent: 'space-around',
		backgroundColor: theme.colors.n75,
	},
	header: {
		height: 16,
		width: '100%',
		marginBottom: 8,
		borderRadius: 500,
		backgroundColor: theme.colors.n100,
	},
	paragraph: {
		height: 8,
		width: '100%',
		marginBottom: 8,
		borderRadius: 500,
		backgroundColor: theme.colors.n100,
		'&:last-of-type': {
			width: '60%',
			marginBottom: 0,
		},
	},
}));

interface CustomRowButtonProps {
	title: string;
	cols?: number;
	className?: string;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const CustomRowButton = ({ title, cols = 1, className, onClick }: CustomRowButtonProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.customRowButton, className)}>
			<div className="overlay">
				<Button onClick={onClick}>{title}</Button>
			</div>
			{Array.apply(null, Array(cols)).map((_col, colIndex) => (
				<div className={classes.column} key={colIndex}>
					<div className={classes.image}>
						<ImageIcon className="text-gray" />
					</div>
					<div className={classes.header} />
					<div className={classes.paragraph} />
					<div className={classes.paragraph} />
				</div>
			))}
		</div>
	);
};
