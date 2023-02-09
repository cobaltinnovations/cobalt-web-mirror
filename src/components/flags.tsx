import { createUseThemedStyles } from '@/jss/theme';
import React from 'react';

const useStyles = createUseThemedStyles((theme) => ({
	flagsOuter: {
		left: 0,
		bottom: 0,
		zIndex: 1,
		position: 'fixed',
	},
}));

const Flags = () => {
	const classes = useStyles();

	return (
		<div className={classes.flagsOuter}>
			<ul>FLAGS</ul>
		</div>
	);
};

export default Flags;
