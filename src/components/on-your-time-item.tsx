import React, { FC } from 'react';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { createUseThemedStyles } from '@/jss/theme';

const useOnYourTimeItemStyles = createUseThemedStyles((theme) => ({
	onYourTimeItem: {
		padding: 8,
		borderRadius: 5,
		display: 'flex',
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		boxShadow: '0px 3px 5px rgba(41, 40, 39, 0.2), 0px 0px 1px rgba(41, 40, 39, 0.31)',
	},
	imageContainer: {
		flexShrink: 0,
	},
	title: {
		marginBottom: 4,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	author: {
		marginBottom: 8,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	tag: {
		top: 4,
		left: 0,
		padding: '1px 5px',
		...theme.fonts.uiSmall,
		...theme.fonts.bodyBold,
		color: theme.colors.n0,
		position: 'absolute',
		textTransform: 'uppercase',
		backgroundColor: theme.colors.a500,
	},
	informationContainer: {
		flex: 1,
		paddingLeft: 16,
		paddingRight: 8,
		color: theme.colors.n900,
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
				size={80}
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
					<small className="text-muted text-uppercase fw-bold">{props.type}</small>
					{props.duration && <small className="text-muted text-uppercase ms-auto">{props.duration}</small>}
				</div>
			</div>
		</div>
	);
};

export default OnYourTimeItem;
