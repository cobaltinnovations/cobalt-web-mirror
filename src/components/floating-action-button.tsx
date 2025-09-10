import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import SvgIcon from './svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	floatingActionButton: {
		bottom: 36,
		right: 20,
		zIndex: 3,
		position: 'fixed',
		border: 0,
		appearance: 'none',
		width: 48,
		height: 48,
		borderRadius: 27,
		color: theme.colors.n0,
		backgroundColor: theme.colors.p500,
		transition: `200ms transform`,
		'&:focus': {
			outline: 'none',
		},
	},
	addIcon: {
		'& path': {
			fill: 'white',
		},
	},
}));

const FloatingActionButton = ({
	className,
	children,
	...buttonProps
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
	const classes = useStyles();

	return (
		<button className={classNames(classes.floatingActionButton, className)} {...buttonProps}>
			{children}
			<SvgIcon kit="fas" icon="plus" size={20} className={classes.addIcon} />
		</button>
	);
};

export default FloatingActionButton;
