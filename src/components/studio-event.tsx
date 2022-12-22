import React, { FC } from 'react';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import { GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import BackgroundImageContainer from '@/components/background-image-container';
import { createUseThemedStyles } from '@/jss/theme';

const useStudioEventStyles = createUseThemedStyles((theme) => ({
	studioEvent: {
		display: 'flex',
		borderRadius: 5,
		overflow: 'hidden',
		flexDirection: 'column',
		filter: 'drop-shadow(0px 3px 5px rgba(41, 40, 39, 0.2)) drop-shadow(0px 0px 1px rgba(41, 40, 39, 0.31))',
	},
	imageContainer: {
		flexShrink: 0,
		paddingBottom: '56.25%',
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

export type StudioEventViewModel = (GroupSessionModel | GroupSessionRequestModel) & {
	urlName?: string;
	isGrouped?: boolean;
};

interface StudioEventProps {
	studioEvent: StudioEventViewModel;
	className?: string;
}

const StudioEvent: FC<StudioEventProps> = ({ studioEvent, className }) => {
	const classes = useStudioEventStyles();
	const placeholderImage = useRandomPlaceholderImage();

	if (groupSessionsService.isGroupSession(studioEvent)) {
		return (
			<div className={classNames(classes.studioEvent, className)}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={studioEvent.imageUrl ? studioEvent.imageUrl : placeholderImage}
				>
					{!studioEvent.isGrouped && (
						<div className={classes.imageContent}>
							{studioEvent.seatsAvailable && studioEvent.seatsAvailable <= 20 ? (
								<Badge as="div" bg="outline-secondary" pill>
									{studioEvent.seatsAvailableDescription}
								</Badge>
							) : null}
						</div>
					)}
				</BackgroundImageContainer>
				<div className={classes.informationContainer}>
					<h4 className="mb-0">{studioEvent.title}</h4>
					{!studioEvent.isGrouped && (
						<p className="mb-0 text-muted fw-bold text-uppercase">
							{studioEvent.appointmentTimeDescription}
						</p>
					)}
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
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={studioEvent.imageUrl ? studioEvent.imageUrl : placeholderImage}
				/>
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
