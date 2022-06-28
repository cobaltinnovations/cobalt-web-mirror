import React, { FC } from 'react';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { groupEventService, groupSessionsService } from '@/lib/services';
import { GroupEvent, ExternalGroupEventType, GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';

const useStudioEventStyles = createUseThemedStyles((theme) => ({
	imageContainer: {
		paddingBottom: '56.25%',
	},
	imageContent: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		padding: '15px 20px',
		position: 'absolute',
	},
	informationContainer: {
		color: theme.colors.dark,
		padding: '10px 20px',
		backgroundColor: theme.colors.white,
	},
}));

export type StudioEventViewModel = (
	| GroupEvent
	| ExternalGroupEventType
	| GroupSessionModel
	| GroupSessionRequestModel
) & {
	urlName?: string;
	isGrouped?: boolean;
};

interface StudioEventProps {
	groupEvent: StudioEventViewModel;
	className?: string;
}

const StudioEvent: FC<StudioEventProps> = ({ groupEvent, className }) => {
	const classes = useStudioEventStyles();
	const placeholderImage = useRandomPlaceholderImage();

	if (groupEventService.isEventExternal(groupEvent)) {
		return (
			<div className={className}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				/>
				<div className={classes.informationContainer}>
					<h5 className="mb-0">{groupEvent.name}</h5>
				</div>
			</div>
		);
	}

	if (groupSessionsService.isGroupSession(groupEvent)) {
		return (
			<div className={className}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				>
					{!groupEvent.isGrouped && (
						<div className={classes.imageContent}>
							<small className="text-white text-uppercase font-secondary-bold">
								{groupEvent.seatsAvailableDescription}
							</small>
						</div>
					)}
				</BackgroundImageContainer>
				<div className={classes.informationContainer}>
					<h5 className="mb-0">{groupEvent.title}</h5>
					{!groupEvent.isGrouped && <p className="mb-0">{groupEvent.appointmentTimeDescription}</p>}
				</div>
			</div>
		);
	}

	if (groupSessionsService.isGroupSessionByRequest(groupEvent)) {
		return (
			<div className={className}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				/>
				<div className={classes.informationContainer}>
					<h5 className="mb-0">{groupEvent.title}</h5>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			<BackgroundImageContainer
				className={classes.imageContainer}
				imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
			>
				{!groupEvent.isGrouped && (
					<div className={classes.imageContent}>
						<small className="text-white text-uppercase font-secondary-bold">
							{groupEvent.seatsAvailableDescription}
						</small>
					</div>
				)}
			</BackgroundImageContainer>
			<div className={classes.informationContainer}>
				<h5 className="mb-0">{groupEvent.name}</h5>
				{!groupEvent.isGrouped && <p className="mb-0">{groupEvent.timeDescription}</p>}
			</div>
		</div>
	);
};

export default StudioEvent;
