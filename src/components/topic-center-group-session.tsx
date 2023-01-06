import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { SkeletonBadge, SkeletonButton, SkeletonImage, SkeletonText } from '@/components/skeleton-loaders';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	topicCenterGroupSession: {
		padding: 20,
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		boxShadow: '0px 10px 18px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		[mediaQueries.lg]: {
			padding: 0,
			cursor: 'pointer',
			flexDirection: 'column',
		},
	},
	imageOuter: {
		width: 240,
		minHeight: 170,
		flexShrink: 0,
		borderRadius: 5,
		position: 'relative',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
		'& .cobalt-badge': {
			right: 8,
			bottom: 8,
			position: 'absolute',
		},
		[mediaQueries.lg]: {
			height: 210,
			width: '100%',
			borderRadius: 0,
		},
	},
	informationOuter: {
		flex: 1,
		display: 'flex',
		paddingLeft: 24,
		flexDirection: 'column',
		justifyContent: 'space-between',
		[mediaQueries.lg]: {
			padding: 20,
		},
	},
}));

interface Props {
	title: string;
	titleSecondary: string;
	titleTertiary?: string;
	description: string;
	badgeTitle?: string;
	buttonTitle: string;
	onClick(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>): void;
	imageUrl?: string;
	className?: string;
}

const ResponsiveEllipsis = responsiveHOC()(HTMLEllipsis);

export const TopicCenterGroupSession = ({
	title,
	titleSecondary,
	titleTertiary,
	description,
	badgeTitle,
	buttonTitle,
	onClick,
	imageUrl,
	className,
}: Props) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [isMobile, setIsMobile] = useState(false);

	const setIsMobileFlag = useCallback(() => {
		if (window.innerWidth >= 992) {
			setIsMobile(false);
		} else {
			setIsMobile(true);
		}
	}, [setIsMobile]);

	useEffect(() => {
		const handleWindowResize = debounce(setIsMobileFlag, 200);
		window.addEventListener('resize', handleWindowResize);

		setIsMobileFlag();
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [setIsMobileFlag]);

	return (
		<div
			className={classNames(classes.topicCenterGroupSession, className)}
			onClick={isMobile ? onClick : undefined}
		>
			<div
				className={classes.imageOuter}
				style={{ backgroundImage: `url(${imageUrl ? imageUrl : placeholderImage})` }}
			>
				{badgeTitle && (
					<Badge className="d-lg-none" as="div" bg="outline-secondary" pill>
						{badgeTitle}
					</Badge>
				)}
			</div>
			<div className={classes.informationOuter}>
				<div>
					<div className="mb-lg-4">
						<h4 className="mb-1">{title}</h4>
						<p
							className={classNames('text-muted text-uppercase fw-bold', {
								'mb-1': titleTertiary,
								'mb-0': !titleTertiary,
							})}
						>
							{titleSecondary}
						</p>
						{titleTertiary && <p className="mb-0 text-muted">{titleTertiary}</p>}
					</div>
					<ResponsiveEllipsis
						className="d-none d-lg-block mb-4"
						unsafeHTML={description}
						maxLine={titleTertiary ? '2' : '3'}
					/>
				</div>
				<div className="d-none d-lg-flex justify-content-between align-items-end">
					<div>
						{badgeTitle && (
							<Badge as="div" bg="outline-secondary" pill>
								{badgeTitle}
							</Badge>
						)}
					</div>
					<Button size="sm" onClick={onClick}>
						{buttonTitle}
					</Button>
				</div>
			</div>
		</div>
	);
};

interface SkeletonTopicCenterGroupSessionProps {
	className?: string;
}

export const SkeletonTopicCenterGroupSession = ({ className }: SkeletonTopicCenterGroupSessionProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.topicCenterGroupSession, className)}>
			<SkeletonImage className={classes.imageOuter}>
				<SkeletonBadge className="d-lg-none" />
			</SkeletonImage>
			<div className={classes.informationOuter}>
				<div>
					<div className="mb-lg-4">
						<SkeletonText type="h4" className="mb-1" />
						<SkeletonText type="p" className="mb-1" />
						<SkeletonText type="p" className="mb-0" />
					</div>
					<SkeletonText type="p" className="d-none d-lg-block mb-4" numberOfLines={2} />
				</div>
				<div className="d-none d-lg-flex justify-content-between align-items-end">
					<div>
						<SkeletonBadge className="d-lg-none" />
					</div>
					<SkeletonButton />
				</div>
			</div>
		</div>
	);
};
