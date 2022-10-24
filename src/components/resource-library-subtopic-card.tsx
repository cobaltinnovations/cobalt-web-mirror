import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

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
		'&:hover': {
			textDecoration: 'underline',
		},
	},
}));

interface Props {
	title: string;
	description: string;
	className?: string;
}

const ResourceLibrarySubtopicCard = ({ title, description, className }: Props) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.resourceLibrarySubtopicCard, className)}>
			<div className="mb-15">
				<h2 className="mb-4">{title}</h2>
				<p className="mb-0">{description}</p>
			</div>
			<div>
				<p className="mb-0">
					<Link to="/" className={classNames(classes.exploreAllLink, 'fw-normal')}>
						Explore All {title} Content
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ResourceLibrarySubtopicCard;
