import React, { FC } from 'react';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import BackgroundImageContainer from '@/components/background-image-container';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	onYourTimeItem: {
		borderRadius: 5,
		overflow: 'hidden',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	imageContainer: {
		paddingBottom: '66.66%',
	},
	title: {
		marginBottom: 2,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		color: theme.colors.n900,
	},
	author: {
		marginBottom: 12,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		color: theme.colors.n500,
	},
	tag: {
		top: 10,
		left: 10,
		position: 'absolute',
	},
	informationContainer: {
		padding: '16px 20px',
	},
	typeTitle: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
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
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();

	return (
		<div className={classNames(classes.onYourTimeItem, props.className)}>
			<BackgroundImageContainer className={classes.imageContainer} imageUrl={props.imageUrl || placeholderImage}>
				{props.tag && (
					<Badge className={classes.tag} bg="secondary" pill>
						{props.tag}
					</Badge>
				)}
			</BackgroundImageContainer>
			<div className={classes.informationContainer}>
				<h4 className={classes.title}>{props.title}</h4>
				{props.author ? (
					<p className={classes.author}>By {props.author}</p>
				) : (
					<p className={classes.author}>&nbsp;</p>
				)}
				<div className="d-flex">
					<small className={classNames(classes.typeTitle, 'text-muted text-uppercase fw-bold')}>
						{props.type}
					</small>
					{props.duration && (
						<small className="flex-shrink-0 text-muted text-uppercase ms-auto">{props.duration}</small>
					)}
				</div>
			</div>
		</div>
	);
};

export default OnYourTimeItem;
