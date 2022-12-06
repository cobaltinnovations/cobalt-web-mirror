import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import { COLOR_IDS, ContentTypeId, TagModel } from '@/lib/models';
import { getTextClassForColorId } from '@/lib/utils/color-utils';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ContentTypeIcon from '@/components/content-type-icon';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibraryCard: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		flexDirection: 'column',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		transition: '0.2s all',
		'&:hover': {
			transform: 'translateY(-16px)',
			boxShadow: theme.elevation.e400,
		},
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
		padding: '16px 20px',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	link: {
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline',
		},
	},
}));

interface Props {
	colorId: COLOR_IDS;
	subtopic: string;
	subtopicTo: string;
	title: string;
	author: string;
	description: string;
	tags: TagModel[];
	contentTypeId: ContentTypeId;
	badgeTitle?: string;
	imageUrl?: string;
	duration?: string;
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
	contentTypeId,
	badgeTitle,
	imageUrl,
	duration,
	className,
}: Props) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [descriptionMaxLine, setDescriptionMaxLine] = useState(2);

	const handleTitleReflow = useCallback(({ clamped }: { clamped: boolean; text: string }) => {
		if (clamped) {
			setDescriptionMaxLine(2);
		} else {
			setDescriptionMaxLine(3);
		}
	}, []);

	return (
		<div className={classNames(classes.resourceLibraryCard, className)}>
			<div className={classes.imageOuter} style={{ backgroundImage: `url(${imageUrl ?? placeholderImage})` }}>
				{badgeTitle && (
					<Badge as="div" bg="light" pill>
						{badgeTitle}
					</Badge>
				)}
			</div>
			<div className={classes.informationOuter}>
				<div>
					<p className="mb-2 fw-bold">
						<Link to={subtopicTo} className={classNames(classes.link, getTextClassForColorId(colorId))}>
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
					<p className="mb-2 text-gray">by {author}</p>
					<ResponsiveHtmlEllipsis
						className="d-none d-lg-block"
						unsafeHTML={description}
						maxLine={descriptionMaxLine}
					/>
				</div>
				<div className="d-flex justify-content-between align-items-end">
					<div className="d-none d-lg-flex flex-wrap">
						{tags.map((tag) => {
							return (
								<Link
									key={tag.tagId}
									to={`/resource-library/tags/${tag.urlName}`}
									className={classes.link}
								>
									<Badge
										bg="outline-dark"
										pill
										as="div"
										className="me-1 mt-1 fs-ui-small text-capitalize fw-normal"
									>
										{tag.name}
									</Badge>
								</Link>
							);
						})}
					</div>
					<div className="d-flex align-items-center flex-shrink-0">
						<ContentTypeIcon contentTypeId={contentTypeId} width={16} height={16} className="text-gray" />
						{duration && <span className="ms-1 fs-ui-small fw-bold text-gray">{duration}</span>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResourceLibraryCard;
