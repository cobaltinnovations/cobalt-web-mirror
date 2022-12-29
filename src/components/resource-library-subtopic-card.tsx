import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import { COLOR_IDS } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibrarySubtopicCard: {
		display: 'flex',
		borderRadius: 8,
		transition: '0.2s all',
		textDecoration: 'none',
		flexDirection: 'column',
		color: theme.colors.n900,
		padding: '32px 24px 24px 24px',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		boxShadow: theme.elevation.e200,
		'&:hover': {
			cursor: 'pointer',
			color: 'inherit',
			transform: 'translateY(-16px)',
			boxShadow: theme.elevation.e400,
		},
	},
}));

interface Props {
	colorId: COLOR_IDS;
	title: string;
	description: string;
	to: string;
	className?: string;
}

const ResourceLibrarySubtopicCard = ({ colorId, title, description, to, className }: Props) => {
	const classes = useStyles();
	const navigate = useNavigate();

	return (
		<div
			onClick={() => {
				navigate(to);
			}}
			className={classNames(
				classes.resourceLibrarySubtopicCard,
				getBackgroundClassForColorId(colorId),
				className
			)}
		>
			<div className="mb-15">
				<h2 className="mb-4">{title}</h2>
				<p className="mb-0">{description}</p>
			</div>

			<Link to={to} className="mb-0 text-decoration-none">
				Explore all {title.toLowerCase()} content
			</Link>
		</div>
	);
};

export default ResourceLibrarySubtopicCard;
