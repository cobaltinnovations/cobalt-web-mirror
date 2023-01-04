import React from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { Badge, Button } from 'react-bootstrap';

interface useStylesProps {
	bgColor?: string;
}

const useStyles = createUseThemedStyles((theme) => ({
	skeleton: ({ bgColor }: useStylesProps) => ({
		backgroundPosition: '0 0',
		backgroundSize: '50px 100%',
		backgroundRepeat: 'repeat-y',
		animation: '$skeleton-loading 1s linear infinite',
		background: `linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${
			bgColor ?? theme.colors.n50
		}`,
	}),
	skeletonText: {
		borderRadius: 4,
		display: 'inline-block',
	},
	skeletonImage: ({ bgColor }: useStylesProps) => ({
		backgroundColor: `${bgColor ?? theme.colors.n50} !important`,
	}),
	skeletonBadge: ({ bgColor }: useStylesProps) => ({
		width: 85,
		backgroundColor: `${bgColor ?? theme.colors.n50} !important`,
	}),
	skeletonButton: ({ bgColor }: useStylesProps) => ({
		cursor: 'default',
		display: 'inline-block',
		'&:hover, &:active': {
			background: `linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${
				bgColor ?? theme.colors.n50
			}`,
		},
	}),
	'@keyframes skeleton-loading': {
		'0%': {
			backgroundPosition: '-50px 0',
		},
		'100%': {
			backgroundPosition: 'calc(100% + 50px) 0',
		},
	},
}));

interface SkeletonProps {
	bgColor?: string;
}

interface SkeletonTextProps extends SkeletonProps {
	type: string;
	width?: number | string;
	className?: string;
	numberOfLines?: number;
}

export const SkeletonText = ({ type, width, className, numberOfLines, bgColor }: SkeletonTextProps) => {
	const classes = useStyles({ bgColor });
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

interface SkeletonImageProps extends SkeletonProps {
	width?: number | string;
	height?: number | string;
	className?: string;
}

export const SkeletonImage = ({ width, height, className, bgColor }: SkeletonImageProps) => {
	const classes = useStyles({ bgColor });

	return (
		<div
			className={classNames(classes.skeleton, classes.skeletonImage, className)}
			style={{ width: width ?? 'auto', height: height ?? 'auto' }}
		/>
	);
};

interface SkeletonBadgeProps extends SkeletonProps {
	className?: string;
}

export const SkeletonBadge = ({ className, bgColor }: SkeletonBadgeProps) => {
	const classes = useStyles({ bgColor });

	return (
		<Badge pill as="div" className={classNames(classes.skeleton, classes.skeletonBadge, className)}>
			&nbsp;
		</Badge>
	);
};

interface SkeletonButtonProps extends SkeletonProps {
	width?: number | string;
	className?: string;
}

export const SkeletonButton = ({ width, className, bgColor }: SkeletonButtonProps) => {
	const classes = useStyles({ bgColor });

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
