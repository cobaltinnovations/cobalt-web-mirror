import React, { FC } from 'react';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { createUseThemedStyles } from '@/jss/theme';

const useOnYourTimeItemStyles = createUseThemedStyles((theme) => ({
	onYourTimeItem: {
		padding: 8,
		display: 'flex',
		alignItems: 'center',
		backgroundColor: theme.colors.white,
	},
	imageContainer: {
		flexShrink: 0,
	},
	title: {
		marginBottom: 5,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	author: {
		marginBottom: 10,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	tag: {
		top: 8,
		left: 8,
		...theme.fonts.xxxs,
		...theme.fonts.secondaryBold,
		color: theme.colors.white,
		position: 'absolute',
		textTransform: 'uppercase',
	},
	informationContainer: {
		flex: 1,
		paddingLeft: 16,
		paddingRight: 8,
		color: theme.colors.dark,
		overflow: 'hidden',
	},
}));

interface OnYourTimeItemProps {
	className?: string;
	imageUrl?: string;
	tag?: string;
	title: string;
	author: string;
	type: string;
	duration?: string;
}

const OnYourTimeItem: FC<OnYourTimeItemProps> = (props) => {
	const classes = useOnYourTimeItemStyles();
	const placeholderImage = useRandomPlaceholderImage();

	return (
		<div className={classNames(classes.onYourTimeItem, props.className)}>
			<BackgroundImageContainer
				size={82}
				className={classes.imageContainer}
				imageUrl={props.imageUrl || placeholderImage}
			>
				{props.tag && <div className={classes.tag}>{props.tag}</div>}
			</BackgroundImageContainer>
			<div className={classes.informationContainer}>
				<h6 className={classes.title}>{props.title}</h6>
				{props.author ? (
					<p className={classes.author}>by {props.author}</p>
				) : (
					<p className={classes.author}>&nbsp;</p>
				)}

				<div className="d-flex">
					<small className="text-muted text-uppercase font-secondary-bold">{props.type}</small>

					{props.duration && (
						<small className="text-muted text-uppercase font-secondary-bold ml-auto">
							{props.duration}
						</small>
					)}
				</div>
			</div>
		</div>
	);
};

export default OnYourTimeItem;
