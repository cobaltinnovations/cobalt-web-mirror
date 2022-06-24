import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useBackgroundImageContainerStyles = createUseThemedStyles((theme) => ({
	backgroundImageContainer: ({ imageUrl, size }: { imageUrl: string; size?: number }) => ({
		flexShrink: 0,
		position: 'relative',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.gray300,
		backgroundImage: `url(${imageUrl})`,
		...(size
			? {
					width: size,
					height: size,
			  }
			: {}),
	}),
}));

interface BackgroundImageContainerProps extends PropsWithChildren {
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
