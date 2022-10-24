import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { COLOR_IDS } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibrarySubtopicCard: {
		display: 'flex',
		borderRadius: 8,
		flexDirection: 'column',
		padding: '32px 24px 24px 24px',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		filter: 'drop-shadow(0px 3px 5px rgba(41, 40, 39, 0.2)) drop-shadow(0px 0px 1px rgba(41, 40, 39, 0.31))',
	},
	exploreAllLink: {
		textDecoration: 'none',
		color: theme.colors.n900,
		'&:hover': {
			color: theme.colors.n900,
			textDecoration: 'underline',
		},
	},
}));

interface Props {
	colorId: COLOR_IDS;
	title: string;
	description: string;
	className?: string;
}

const ResourceLibrarySubtopicCard = ({ colorId, title, description, className }: Props) => {
	const classes = useStyles();

	const backgroundColorClass = useMemo(() => {
		switch (colorId) {
			case COLOR_IDS.BRAND_PRIMARY:
				return 'bg-p50';
			case COLOR_IDS.BRAND_ACCENT:
				return 'bg-a50';
			case COLOR_IDS.SEMANTIC_DANGER:
				return 'bg-d50';
			case COLOR_IDS.SEMANTIC_WARNING:
				return 'bg-w50';
			case COLOR_IDS.SEMANTIC_SUCCESS:
				return 'bg-s50';
			case COLOR_IDS.SEMANTIC_INFO:
				return 'bg-i50';
			default:
				return 'bg-n50';
		}
	}, [colorId]);

	return (
		<div className={classNames(classes.resourceLibrarySubtopicCard, backgroundColorClass, className)}>
			<div className="mb-15">
				<h2 className="mb-4">{title}</h2>
				<p className="mb-0">{description}</p>
			</div>
			<div>
				<p className="mb-0">
					<Link to="/" className={classNames(classes.exploreAllLink, 'fw-normal')}>
						Explore all {title.toLowerCase()} content
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ResourceLibrarySubtopicCard;
