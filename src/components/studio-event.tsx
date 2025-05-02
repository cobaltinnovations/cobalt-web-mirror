import React, { FC } from 'react';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import { GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import BackgroundImageContainer from '@/components/background-image-container';
import { SkeletonImage, SkeletonText } from '@/components/skeleton-loaders';
import { createUseThemedStyles } from '@/jss/theme';

const useStudioEventStyles = createUseThemedStyles((theme) => ({
	studioEvent: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		transition: '0.2s all',
		flexDirection: 'column',
		border: `1px solid ${theme.colors.border}`,
		'&:hover': {
			transform: 'translateY(-16px)',
			boxShadow: theme.elevation.e400,
		},
	},
	studioEventSkeleton: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		flexDirection: 'column',
		border: `1px solid ${theme.colors.border}`,
	},
	imageContainer: {
		flexShrink: 0,
		paddingBottom: '56.25%',
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
	imageContent: {
		right: 0,
		bottom: 0,
		padding: 8,
		position: 'absolute',
	},
	informationContainer: {
		flex: 1,
		padding: 20,
		color: theme.colors.n900,
		backgroundColor: theme.colors.n0,
	},
}));

export type StudioEventViewModel = GroupSessionModel | GroupSessionRequestModel;

interface StudioEventProps {
	studioEvent: StudioEventViewModel;
	expired?: boolean;
	className?: string;
}

const StudioEvent: FC<StudioEventProps> = ({ studioEvent, expired, className }) => {
	const classes = useStudioEventStyles();
	const placeholderImage = useRandomPlaceholderImage();

	const showSeatAlert =
		groupSessionsService.isGroupSession(studioEvent) &&
		typeof studioEvent.seatsAvailable !== 'undefined' &&
		typeof studioEvent.seats !== 'undefined' &&
		(studioEvent.seatsAvailable <= 5 || studioEvent.seatsAvailable / studioEvent.seats <= 0.1);

	if (groupSessionsService.isGroupSession(studioEvent)) {
		return (
			<div className={classNames(classes.studioEvent, className)}>
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
					<BackgroundImageContainer
						className={classes.imageContainer}
						imageUrl={studioEvent.imageUrl ? studioEvent.imageUrl : placeholderImage}
					>
						{showSeatAlert && (
							<div className={classes.imageContent}>
								<Badge as="div" bg="outline-secondary" pill>
									{studioEvent.seatsAvailableDescription}
								</Badge>
							</div>
						)}
					</BackgroundImageContainer>
				)}
				<div className={classes.informationContainer}>
					<h4 className="mb-0">{studioEvent.title}</h4>

					<p className="mb-0 text-muted fw-bold">{studioEvent.appointmentTimeDescription}</p>

					{studioEvent.facilitatorName && (
						<p className="mb-0 text-muted">
							<>with {studioEvent.facilitatorName}</>
						</p>
					)}
				</div>
			</div>
		);
	} else if (groupSessionsService.isGroupSessionByRequest(studioEvent)) {
		return (
			<div className={classNames(classes.studioEvent, className)}>
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
					<BackgroundImageContainer
						className={classes.imageContainer}
						imageUrl={studioEvent.imageUrl ? studioEvent.imageUrl : placeholderImage}
					/>
				)}

				<div className={classes.informationContainer}>
					<h4 className="mb-0">{studioEvent.title}</h4>
					{studioEvent.facilitatorName && (
						<p className="mb-0 text-muted">
							<>with {studioEvent.facilitatorName}</>
						</p>
					)}
				</div>
			</div>
		);
	} else {
		console.warn('attempting to render an unknown studio event');
		return null;
	}
};

export default StudioEvent;

interface StudioEventSkeletonProps {
	className?: string;
}

export const StudioEventSkeleton = ({ className }: StudioEventSkeletonProps) => {
	const classes = useStudioEventStyles();

	return (
		<div className={classNames(classes.studioEventSkeleton, className)}>
			<SkeletonImage className={classes.imageContainer} />
			<div className={classes.informationContainer}>
				<SkeletonText type="h4" className="mb-1" width="75%" />
				<SkeletonText type="p" className="mb-1" />
				<SkeletonText type="p" className="mb-0" width="50%" />
			</div>
		</div>
	);
};
