import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useLoaderStyles = createUseStyles({
	loader: ({ size }: { size: number }) => ({
		zIndex: 0,
		top: '50%',
		left: '50%',
		position: 'absolute',
		width: size || 56,
		height: size || 56,
		marginTop: -(size / 2) || -28,
		marginLeft: -(size / 2) || -28,
		borderRadius: '50%',
		borderTopColor: colors.primary,
		border: `8px solid ${colors.border}`,
		animation: `$rotate 1000ms linear 0ms infinite normal`,
	}),
	'@keyframes rotate': {
		'0%': {
			transform: 'rotate(0deg)',
		},
		'100%': {
			transform: 'rotate(360deg)',
		},
	},
});

interface LoaderProps {
	size?: number;
	className?: string;
}

const Loader: FC<LoaderProps> = React.memo(({ size = 64, className }) => {
	const classes = useLoaderStyles({ size });

	return <div className={classNames(classes.loader, className)} />;
});

Loader.displayName = 'Loader';

export default Loader;
