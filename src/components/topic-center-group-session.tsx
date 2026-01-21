import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
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
		border: `1px solid ${theme.colors.n100}`,
		transition: 'box-shadow 0.2s, transform 0.2s',
		[mediaQueries.lg]: {
			padding: 0,
			cursor: 'pointer',
			flexDirection: 'column',
		},
		'&:hover': {
			transform: 'translateY(-16px)',
			boxShadow: '0px 10px 18px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		},
	},
	imageOuter: {
		width: 240,
		flexShrink: 0,
		position: 'relative',
		'& .cobalt-badge': {
			right: 8,
			bottom: 8,
			position: 'absolute',
		},
		[mediaQueries.lg]: {
			width: '100%',
		},
	},
	image: {
		width: '100%',
		borderRadius: 5,
		overflow: 'hidden',
		paddingBottom: '56.25%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
		[mediaQueries.lg]: {
			borderRadius: 0,
		},
	},
	expired: {
		width: '100%',
		borderRadius: 5,
		position: 'relative',
		paddingBottom: '56.25%',
		backgroundColor: theme.colors.d500,
	},
	expiredInner: {
		top: '50%',
		left: '50%',
		width: '100%',
		padding: '0 16px',
		position: 'absolute',
		transform: 'translate(-50%, -50%)',
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
	expired?: boolean;
}

export const TopicCenterGroupSession = ({
	title,
	titleSecondary,
	titleTertiary,
	badgeTitle,
	buttonTitle,
	onClick,
	imageUrl,
	className,
	expired,
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
			<div className={classes.imageOuter}>
				{badgeTitle && (
					<Badge as="div" bg="outline-secondary" pill>
						{badgeTitle}
					</Badge>
				)}
				{expired ? (
					<div className={classes.expired}>
						<div className={classes.expiredInner}>
							<h6 className="mb-2 text-center text-white">Session Expired</h6>
							<p className="mb-0 text-center text-white">
								This session will not be visible when the page is published
							</p>
						</div>
					</div>
				) : (
					<div
						className={classes.image}
						style={{ backgroundImage: `url(${imageUrl ? imageUrl : placeholderImage})` }}
					/>
				)}
			</div>
			<div className={classes.informationOuter}>
				<div>
					<div className="mb-lg-4">
						<h4 className="mb-1">{title}</h4>
						<p
							className={classNames('fw-bold', {
								'mb-1': titleTertiary,
								'mb-0': !titleTertiary,
							})}
						>
							{titleSecondary}
						</p>
						{titleTertiary && <p className="mb-0 text-muted">{titleTertiary}</p>}
					</div>
				</div>
				<div className="d-none d-lg-flex justify-content-start align-items-end">
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
