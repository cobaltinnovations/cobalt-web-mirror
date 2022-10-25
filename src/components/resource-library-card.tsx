import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import { COLOR_IDS } from '@/lib/models';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibraryCard: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		flexDirection: 'column',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	imageOuter: {
		position: 'relative',
		paddingBottom: '56.25%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
		'& .cobalt-badge': {
			top: 8,
			right: 8,
			position: 'absolute',
		},
	},
	informationOuter: {
		flex: 1,
		display: 'flex',
		padding: '16px 20px 10px',
		flexDirection: 'column',
	},
	subtopicLink: {
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline',
		},
	},
	tagsOuter: {
		display: 'flex',
		flewWrap: 'wrap',
		overflow: 'hidden',
		padding: '0px 20px 12px',
	},
}));

interface Props {
	colorId: COLOR_IDS;
	subtopic: string;
	subtopicTo: string;
	title: string;
	author: string;
	description: string;
	tags: { tagId: string; description: string }[];
	badgeTitle?: string;
	imageUrl?: string;
	className?: string;
}

const ResponsiveLineEllipsis = responsiveHOC()(LinesEllipsis);
const ResponsiveHtmlEllipsis = responsiveHOC()(HTMLEllipsis);

const ResourceLibraryCard = ({
	colorId,
	subtopic,
	subtopicTo,
	title,
	author,
	description,
	tags,
	badgeTitle,
	imageUrl,
	className,
}: Props) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [descriptionMaxLine, setDescriptionMaxLine] = useState(2);

	const subtopicTitleClass = useMemo(() => {
		switch (colorId) {
			case COLOR_IDS.BRAND_PRIMARY:
				return 'text-primary';
			case COLOR_IDS.BRAND_ACCENT:
				return 'text-secondary';
			case COLOR_IDS.SEMANTIC_DANGER:
				return 'text-danger';
			case COLOR_IDS.SEMANTIC_WARNING:
				return 'text-warning';
			case COLOR_IDS.SEMANTIC_SUCCESS:
				return 'text-success';
			case COLOR_IDS.SEMANTIC_INFO:
				return 'text-info';
			default:
				return 'text-muted';
		}
	}, [colorId]);

	const handleTitleReflow = useCallback((state: { clamped: boolean; text: string }) => {
		const { clamped } = state;

		if (clamped) {
			setDescriptionMaxLine(2);
		} else {
			setDescriptionMaxLine(3);
		}
	}, []);

	return (
		<div className={classNames(classes.resourceLibraryCard, className)}>
			<div
				className={classes.imageOuter}
				style={{ backgroundImage: `url(${imageUrl ? imageUrl : placeholderImage})` }}
			>
				{badgeTitle && (
					<Badge as="div" bg="light" pill>
						{badgeTitle}
					</Badge>
				)}
			</div>
			<div className={classes.informationOuter}>
				<p className="mb-2 fw-bold">
					<Link to={subtopicTo} className={classNames(classes.subtopicLink, subtopicTitleClass)}>
						{subtopic}
					</Link>
				</p>
				<ResponsiveLineEllipsis
					className="mb-1"
					text={title}
					component="h4"
					maxLine={2}
					onReflow={handleTitleReflow}
				/>
				<p className="mb-2 text-muted">by {author}</p>
				<ResponsiveHtmlEllipsis
					className="d-none d-lg-block"
					unsafeHTML={description}
					maxLine={descriptionMaxLine}
				/>
			</div>
			<div className={classes.tagsOuter}>
				{tags.map((tag) => {
					return (
						<Badge
							key={tag.tagId}
							bg="outline-dark"
							pill
							as="div"
							className="me-1 mb-1 fs-ui-small text-capitalize"
						>
							{tag.description}
						</Badge>
					);
				})}
			</div>
		</div>
	);
};

export default ResourceLibraryCard;
