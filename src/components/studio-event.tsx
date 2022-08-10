import React, { FC } from 'react';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import { GroupEvent, ExternalGroupEventType, GroupSessionModel, GroupSessionRequestModel } from '@/lib/models';
import { groupEventService, groupSessionsService } from '@/lib/services';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import BackgroundImageContainer from '@/components/background-image-container';
import { createUseThemedStyles } from '@/jss/theme';

const useStudioEventStyles = createUseThemedStyles((theme) => ({
	studioEvent: {
		borderRadius: 5,
		overflow: 'hidden',
		filter: 'drop-shadow(0px 3px 5px rgba(41, 40, 39, 0.2)) drop-shadow(0px 0px 1px rgba(41, 40, 39, 0.31))',
	},
	imageContainer: {
		paddingBottom: '56.25%',
	},
	imageContent: {
		right: 0,
		bottom: 0,
		padding: 8,
		position: 'absolute',
	},
	informationContainer: {
		padding: 20,
		color: theme.colors.n900,
		backgroundColor: theme.colors.n0,
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
			<div className={classNames(classes.studioEvent, className)}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				/>
				<div className={classes.informationContainer}>
					<h4 className="mb-0">{groupEvent.name}</h4>
				</div>
			</div>
		);
	}

	if (groupSessionsService.isGroupSession(groupEvent)) {
		return (
			<div className={classNames(classes.studioEvent, className)}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				>
					{!groupEvent.isGrouped && (
						<div className={classes.imageContent}>
							<Badge as="div" bg="outline-secondary" pill>
								{groupEvent.seatsAvailableDescription}
							</Badge>
						</div>
					)}
				</BackgroundImageContainer>
				<div className={classes.informationContainer}>
					<h4 className="mb-0">{groupEvent.title}</h4>
					{!groupEvent.isGrouped && <p className="mb-0">{groupEvent.appointmentTimeDescription}</p>}
				</div>
			</div>
		);
	}

	if (groupSessionsService.isGroupSessionByRequest(groupEvent)) {
		return (
			<div className={classNames(classes.studioEvent, className)}>
				<BackgroundImageContainer
					className={classes.imageContainer}
					imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
				/>
				<div className={classes.informationContainer}>
					<h4 className="mb-0">{groupEvent.title}</h4>
				</div>
			</div>
		);
	}

	return (
		<div className={classNames(classes.studioEvent, className)}>
			<BackgroundImageContainer
				className={classes.imageContainer}
				imageUrl={groupEvent.imageUrl ? groupEvent.imageUrl : placeholderImage}
			>
				{!groupEvent.isGrouped && (
					<div className={classes.imageContent}>
						<Badge as="div" bg="outline-secondary" pill>
							{groupEvent.seatsAvailableDescription}
						</Badge>
					</div>
				)}
			</BackgroundImageContainer>
			<div className={classes.informationContainer}>
				<h4 className="mb-0">{groupEvent.name}</h4>
				{!groupEvent.isGrouped && <p className="mb-0">{groupEvent.timeDescription}</p>}
			</div>
		</div>
	);
};

export default StudioEvent;
