import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useBackgroundImageContainerStyles = createUseStyles({
	backgroundImageContainer: ({ imageUrl, size }: { imageUrl: string; size?: number }) => ({
		flexShrink: 0,
		position: 'relative',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: colors.gray300,
		backgroundImage: `url(${imageUrl})`,
		...(size
			? {
					width: size,
					height: size,
			  }
			: {}),
	}),
});

interface BackgroundImageContainerProps {
	size?: number;
	className?: string;
	imageUrl: string;
}

const BackgroundImageContainer: FC<BackgroundImageContainerProps> = (props) => {
	const classes = useBackgroundImageContainerStyles({
		imageUrl: props.imageUrl,
		size: props.size,
	});

	return <div className={classNames(classes.backgroundImageContainer, props.className)}>{props.children}</div>;
};

export default BackgroundImageContainer;
