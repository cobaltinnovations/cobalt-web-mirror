import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { Badge, Button } from 'react-bootstrap';

interface UseStylesProps {
	bgColor?: string;
}

const defaultBg = 'rgba(0, 0, 0, 0.05)';

const useStyles = createUseThemedStyles((theme) => ({
	skeleton: {
		backgroundPosition: '0 0',
		backgroundSize: '50px 100%',
		backgroundRepeat: 'repeat-y',
		animation: '$skeleton-loading 1s linear infinite',
		background: ({ bgColor }: UseStylesProps) =>
			`linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${bgColor ?? defaultBg}`,
	},
	skeletonText: {
		borderRadius: 4,
		display: 'inline-block',
	},
	skeletonImage: {
		backgroundColor: ({ bgColor }: UseStylesProps) => `${bgColor ?? defaultBg} !important`,
	},
	skeletonBadge: {
		width: 85,
		backgroundColor: ({ bgColor }: UseStylesProps) => `${bgColor ?? defaultBg} !important`,
	},
	skeletonButton: {
		cursor: 'default',
		display: 'inline-block',
		'&:hover, &:active': {
			background: ({ bgColor }: UseStylesProps) =>
				`linear-gradient(to right, transparent, ${theme.colors.n0} 50px, transparent 0), ${
					bgColor ?? defaultBg
				}`,
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

export const SkeletonImage = ({
	width,
	height,
	className,
	bgColor,
	children,
}: PropsWithChildren<SkeletonImageProps>) => {
	const classes = useStyles({ bgColor });

	return (
		<div
			className={classNames(classes.skeleton, classes.skeletonImage, className)}
			style={{
				...(width && { width }),
				...(height && { height }),
			}}
		>
			{children}
		</div>
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
