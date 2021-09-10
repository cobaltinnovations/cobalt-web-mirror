import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';

interface ProgressBarProps {
	current: number;
	max: number;
}

const useProgressBarStyles = createUseStyles({
	progressBarContainer: {
		height: 6,
		position: 'relative',
		backgroundColor: colors.white,
	},
	progressBar: (props: ProgressBarProps) => ({
		top: 0,
		left: 0,
		bottom: 0,
		position: 'absolute',
		backgroundColor: colors.warning,
		width: `${(props.current / props.max) * 100}%`,
	}),
});

const ProgressBar: FC<ProgressBarProps> = (props) => {
	const classes = useProgressBarStyles(props);

	return (
		<div className={classes.progressBarContainer}>
			<div className={classes.progressBar} />
		</div>
	);
};

export default ProgressBar;
