import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

const useStyles = createUseStyles({
	circleIndicator: ({ size }: { size?: number }) => ({
		flexShrink: 0,
		borderRadius: 100,
		width: size ? size : 35,
		height: size ? size : 35,
		lineHeight: size ? `${size}px` : '35px',
		textAlign: 'center',
		color: colors.white,
		display: 'inline-block',
		...fonts.nunitoSansBold,
		backgroundColor: colors.secondary,
	}),
});

interface CircleIndicatorProps {
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
