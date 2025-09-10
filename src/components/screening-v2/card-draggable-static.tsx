import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '../svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	cardDraggable: {
		zIndex: 1,
		padding: 16,
		width: '100%',
		height: '100%',
		borderRadius: 4,
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	dragHandleOuter: {
		bottom: 16,
		left: '50%',
		position: 'absolute',
		transform: 'translateX(-50%)',
	},
}));

interface CardDraggableStaticProps {
	cardText?: string;
	className?: string;
}

export const CardDraggableStatic = ({ cardText, className }: CardDraggableStaticProps) => {
	const classes = useStyles();
	return (
		<div className={classNames(classes.cardDraggable, className)}>
			<p className="text-center">{cardText}</p>
			<div className={classes.dragHandleOuter}>
				<SvgIcon kit="far" icon="grip-lines" size={20} className="text-gray" />
			</div>
		</div>
	);
};
