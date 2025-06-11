import React, { FC } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface useProgressBarStylesProps {
	current: number;
	max: number;
	pill?: boolean;
	size?: 'sm' | 'lg';
}

const useProgressBarStyles = createUseThemedStyles((theme) => ({
	progressBarContainer: {
		height: ({ size }: useProgressBarStylesProps) => (size === 'lg' ? 8 : 6),
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: theme.colors.n100,
		borderRadius: ({ pill }: useProgressBarStylesProps) => (pill ? 500 : 0),
	},
	progressBar: {
		top: 0,
		left: 0,
		bottom: 0,
		position: 'absolute',
		backgroundColor: theme.colors.s300,
		borderRadius: ({ pill }: useProgressBarStylesProps) => (pill ? 500 : 0),
		width: ({ current, max }: useProgressBarStylesProps) => `${(current / max) * 100}%`,
	},
}));

interface ProgressBarProps {
	current: number;
	max: number;
	className?: string;
	pill?: boolean;
	size?: 'sm' | 'lg';
}

const ProgressBar: FC<ProgressBarProps> = ({ current, max, size, pill, className }) => {
	const classes = useProgressBarStyles({ current, max, size, pill });

	return (
		<div className={classNames(classes.progressBarContainer, className)}>
			<div className={classes.progressBar} />
		</div>
	);
};

export default ProgressBar;
