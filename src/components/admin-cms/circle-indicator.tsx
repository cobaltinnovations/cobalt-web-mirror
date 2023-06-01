import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	size?: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	circleIndicator: {
		flexShrink: 0,
		borderRadius: 100,
		width: ({ size }: UseStylesProps) => size ?? 35,
		height: ({ size }: UseStylesProps) => size ?? 35,
		lineHeight: ({ size }: UseStylesProps) => `${size ?? 35}px`,
		textAlign: 'center',
		color: theme.colors.n0,
		display: 'inline-block',
		...theme.fonts.headingBold,
		backgroundColor: theme.colors.a500,
	},
}));

interface CircleIndicatorProps extends PropsWithChildren {
	size?: number;
	className?: string;
}

const CircleIndicator: FC<CircleIndicatorProps> = ({ size, className, children }) => {
	const classes = useStyles({
		size,
	});

	return <span className={classNames([classes.circleIndicator, className])}>{children}</span>;
};

export default CircleIndicator;
