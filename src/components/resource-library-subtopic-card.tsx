import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import { COLOR_IDS } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	clickable: boolean;
}

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
			cursor: ({ clickable }: UseStylesProps) => (clickable ? 'pointer' : 'initial'),
			color: 'inherit',
			transform: ({ clickable }: UseStylesProps) => (clickable ? 'translateY(-16px)' : ''),
			boxShadow: ({ clickable }: UseStylesProps) => (clickable ? theme.elevation.e400 : ''),
		},
	},
}));

interface Props {
	colorId?: COLOR_IDS;
	title: string;
	description: string;
	to?: string;
	toLabel?: string;
	className?: string;
}

const ResourceLibrarySubtopicCard = ({ colorId, title, description, to, toLabel, className }: Props) => {
	const classes = useStyles({ clickable: !!to });
	const navigate = useNavigate();

	return (
		<div
			onClick={() => {
				if (!to) {
					return;
				}

				navigate(to);
			}}
			className={classNames(
				classes.resourceLibrarySubtopicCard,
				getBackgroundClassForColorId(colorId),
				className
			)}
		>
			<div className="mb-15">
				<h3 className="mb-4">{title}</h3>
				<div dangerouslySetInnerHTML={{ __html: description }} />
			</div>

			{to && (
				<Link to={to} className="mb-0 text-decoration-none">
					{toLabel || `Explore all ${title} resources`}
				</Link>
			)}
		</div>
	);
};

export default ResourceLibrarySubtopicCard;
