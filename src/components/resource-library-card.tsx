import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

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
	subtopic: string;
	title: string;
	author: string;
	description: string;
	tags: { tagId: string; description: string }[];
	badgeTitle?: string;
	imageUrl?: string;
	className?: string;
}

const ResponsiveEllipsis = responsiveHOC()(HTMLEllipsis);

const ResourceLibraryCard = ({
	subtopic,
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

	const handleTitleReflow = useCallback((state: { clamped: boolean; text: string }) => {
		const { clamped, text } = state;

		console.log('text', text);

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
					<Link to={'/'} className={classNames(classes.subtopicLink, 'text-warning')}>
						{subtopic}
					</Link>
				</p>
				<LinesEllipsis className="mb-1" text={title} component="h4" maxLine={2} onReflow={handleTitleReflow} />
				<p className="mb-2 text-muted">by {author}</p>
				<ResponsiveEllipsis
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
