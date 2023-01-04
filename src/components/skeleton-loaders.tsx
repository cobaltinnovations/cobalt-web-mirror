import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { Badge, Button } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	skeleton: {
		backgroundPosition: '0 0',
		backgroundSize: '50px 100%',
		backgroundRepeat: 'repeat-y',
		animation: '$skeleton-loading 1s linear infinite',
		background: `linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${theme.colors.n50}`,
	},
	skeletonText: {
		borderRadius: 4,
		display: 'inline-block',
	},
	skeletonImage: {
		backgroundColor: `${theme.colors.n50} !important`,
	},
	skeletonBadge: {
		width: 85,
		backgroundColor: `${theme.colors.n50} !important`,
	},
	skeletonButton: {
		cursor: 'default',
		display: 'inline-block',
		'&:hover, &:active': {
			background: `linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${theme.colors.n50}`,
		},
	},
	'@keyframes skeleton-loading': {
		'0%': {
			backgroundPosition: '-50px 0',
		},
		'100%': {
			backgroundPosition: 'calc(100% + 50px) 0',
		},
	},
}));

interface SkeletonTextProps {
	type: string;
	width?: number | string;
	className?: string;
	numberOfLines?: number;
}

export const SkeletonText = ({ type, width, className, numberOfLines }: SkeletonTextProps) => {
	const classes = useStyles();
	const numberOfLinesIterator = Array.apply(null, Array(numberOfLines ?? 1)).map((_value, index) => index);

	return React.createElement(type, {
		className,
		children: (
			<>
				{numberOfLinesIterator.map((_value, index) => {
					const isLast = index === numberOfLinesIterator.length - 1;
					return (
						<span
							key={index}
							className={classNames(classes.skeleton, classes.skeletonText, {
								'mb-1': !isLast,
							})}
							style={{ width: width ?? '100%' }}
						>
							&nbsp;
						</span>
					);
				})}
			</>
		),
	});
};

interface SkeletonImageProps {
	width?: number | string;
	height?: number | string;
	className?: string;
}

export const SkeletonImage = ({ width, height, className }: SkeletonImageProps) => {
	const classes = useStyles();

	return (
		<div
			className={classNames(classes.skeleton, classes.skeletonImage, className)}
			style={{ width: width ?? 'auto', height: height ?? 'auto' }}
		/>
	);
};

interface SkeletonBadgeProps {
	className?: string;
}

export const SkeletonBadge = ({ className }: SkeletonBadgeProps) => {
	const classes = useStyles();

	return (
		<Badge pill as="div" className={classNames(classes.skeleton, classes.skeletonBadge, className)}>
			&nbsp;
		</Badge>
	);
};

interface SkeletonButtonProps {
	width?: number | string;
	className?: string;
}

export const SkeletonButton = ({ width, className }: SkeletonButtonProps) => {
	const classes = useStyles();

	return (
		<Button
			as="div"
			className={classNames(classes.skeleton, classes.skeletonButton, className)}
			style={{ width: width ?? '150px' }}
		>
			&nbsp;
		</Button>
	);
};
