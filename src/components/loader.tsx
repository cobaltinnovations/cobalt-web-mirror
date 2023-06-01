import React, { FC } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	size: number;
}

const useLoaderStyles = createUseThemedStyles((theme) => ({
	loader: {
		zIndex: 0,
		top: '50vh',
		left: '50%',
		position: 'absolute',
		width: ({ size }: UseStylesProps) => size || 56,
		height: ({ size }: UseStylesProps) => size || 56,
		marginTop: ({ size }: UseStylesProps) => -(size / 2) || -28,
		marginLeft: ({ size }: UseStylesProps) => -(size / 2) || -28,
		borderRadius: '50%',
		borderTopColor: theme.colors.p500,
		border: `8px solid ${theme.colors.border}`,
		animation: `$rotate 1000ms linear 0ms infinite normal`,
	},
	'@keyframes rotate': {
		'0%': {
			transform: 'rotate(0deg)',
		},
		'100%': {
			transform: 'rotate(360deg)',
		},
	},
}));

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
