import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	imageUrl: string;
	size?: number;
}

const useBackgroundImageContainerStyles = createUseThemedStyles((theme) => ({
	backgroundImageContainer: {
		flexShrink: 0,
		position: 'relative',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
		backgroundImage: ({ imageUrl }: UseStylesProps) => `url(${imageUrl})`,
		width: ({ size }: UseStylesProps) => size,
		height: ({ size }: UseStylesProps) => size,
	},
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
