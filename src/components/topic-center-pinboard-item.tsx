import React from 'react';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	topicCenterPinboard: {
		padding: 20,
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		boxShadow: '0px 3px 5px rgba(41, 40, 39, 0.2), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		[mediaQueries.lg]: {
			padding: 0,
			flexDirection: 'column',
		},
	},
	imageOuter: {
		width: 80,
		height: 80,
		flexShrink: 0,
		borderRadius: 4,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
	},
	informationOuter: {
		paddingLeft: 16,
		'& h5 a': {
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline',
			},
		},
		[mediaQueries.lg]: {
			padding: '16px 20px',
		},
	},
	description: {
		'& a': {
			...theme.fonts.bodyNormal,
		},
	},
}));

interface Props {
	title: string;
	description: string;
	url: string;
	imageUrl: string;
	className?: string;
}

export const TopicCenterPinboardItem = ({ title, description, url, imageUrl, className }: Props) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.topicCenterPinboard, className)}>
			<div
				className={classNames(classes.imageOuter, 'd-none d-lg-block')}
				style={{ backgroundImage: `url(${imageUrl})` }}
			/>
			<div className={classes.informationOuter}>
				<h5 className="mb-2">
					<a href={url} target="_blank" rel="noreferrer">
						{title}
					</a>
				</h5>
				<div className={classes.description} dangerouslySetInnerHTML={{ __html: description }} />
			</div>
		</div>
	);
};
