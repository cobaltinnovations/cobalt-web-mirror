import { throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { getKalturaScriptForVideo } from '@/lib/utils';
import { AnalyticsNativeEventTypeId, CourseUnitModel, CourseUnitTypeId, CourseVideoModel } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningFlow } from '@/components/screening-v2';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import Loader from '../loader';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseThemedStyles((theme) => ({
	videoPlayerSupplementsOuter: {
		position: 'relative',
	},
	videoPlayerLoader: {
		top: '50%',
		left: '50%',
	},
	videoPlayerOuter: {
		width: '100%',
		borderRadius: 8,
		overflow: 'hidden',
		aspectRatio: '16/9',
		backgroundColor: theme.colors.n900,
		'& #kaltura_player': {
			opacity: 0,
		},
		'&.ready': {
			'& #kaltura_player': {
				opacity: 1,
			},
		},
	},
	screeningFlowOuter: {
		padding: 40,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	imageOuter: {
		'& img': {
			maxWidth: '100%',
		},
	},
}));

interface CourseUnitAvailableProps {
	courseUrlName: string;
	courseSessionId: string;
	courseUnit: CourseUnitModel;
	courseVideos: CourseVideoModel[];
	dependencyCourseUnits: CourseUnitModel[];
	onActivityComplete(): void;
	onSkipActivityButtonClick(): void;
}

export const CourseUnitAvailable = ({
	courseUrlName,
	courseSessionId,
	courseUnit,
	courseVideos,
	dependencyCourseUnits,
	onActivityComplete,
	onSkipActivityButtonClick,
}: CourseUnitAvailableProps) => {
	const classes = useStyles();
	const screeningFlowParams = useMemo(
		() => ({ courseSessionId, screeningFlowId: courseUnit.screeningFlowId }),
		[courseSessionId, courseUnit.screeningFlowId]
	);
	const handleError = useHandleError();

	const [videoPlayerReady, setVideoPlayerReady] = useState(false);
	const [videoPlayerTimedOut, setVideoPlayerTimedOut] = useState(false);
	const videoLoadingTimeoutRef = useRef<NodeJS.Timeout>();

	const stopVideoLoadingTimer = useCallback(() => {
		if (!videoLoadingTimeoutRef.current) {
			return;
		}

		clearTimeout(videoLoadingTimeoutRef.current);
		videoLoadingTimeoutRef.current = undefined;
	}, []);

	const startVideoLoadingTimer = useCallback(() => {
		stopVideoLoadingTimer();
		videoLoadingTimeoutRef.current = setTimeout(() => {
			setVideoPlayerTimedOut(true);
		}, 5000);
	}, [stopVideoLoadingTimer]);

	const throttledPlayerEvent = useRef(
		throttle(
			({
				courseUnitId,
				courseSessionId,
				videoId,
				eventName,
				eventPayload,
			}: {
				courseUnitId: string;
				courseSessionId?: string;
				videoId: string;
				eventName: string;
				eventPayload: unknown;
			}) =>
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_COURSE_UNIT_VIDEO, {
					courseUnitId,
					...(courseSessionId && { courseSessionId }),
					videoId,
					eventName,
					eventPayload,
				}),
			5000,
			{ leading: true, trailing: false }
		)
	).current;

	useEffect(() => {
		if (courseUnit.courseUnitTypeId !== CourseUnitTypeId.VIDEO) {
			return;
		}
		const video = courseVideos.find((v) => v.videoId === courseUnit.videoId);
		if (!video) {
			return;
		}

		setVideoPlayerReady(false);
		setVideoPlayerTimedOut(false);
		startVideoLoadingTimer();

		const { script } = getKalturaScriptForVideo({
			videoPlayerId: 'kaltura_player',
			courseVideo: video,
			eventCallback: (eventName, event) => {
				if (eventName === 'playerReady') {
					setVideoPlayerReady(true);
					setVideoPlayerTimedOut(false);
					stopVideoLoadingTimer();
				}

				if (eventName === 'playerUpdatePlayhead') {
					throttledPlayerEvent({
						courseUnitId: courseUnit.courseUnitId,
						...(courseSessionId && { courseSessionId }),
						videoId: video.videoId,
						eventName,
						eventPayload: event,
					});
				} else {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_COURSE_UNIT_VIDEO, {
						courseUnitId: courseUnit.courseUnitId,
						...(courseSessionId && { courseSessionId }),
						videoId: video.videoId,
						eventName,
						eventPayload: event,
					});
				}
			},
			errorCallback: (error) => {
				setVideoPlayerReady(false);
				setVideoPlayerTimedOut(false);
				stopVideoLoadingTimer();
				handleError(error);
			},
		});

		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [
		courseSessionId,
		courseUnit.courseUnitId,
		courseUnit.courseUnitTypeId,
		courseUnit.videoId,
		courseVideos,
		handleError,
		startVideoLoadingTimer,
		stopVideoLoadingTimer,
		throttledPlayerEvent,
	]);

	return (
		<>
			{dependencyCourseUnits.length > 0 && (
				<InlineAlert
					className="mb-10"
					variant="warning"
					title="Recommended learning path"
					description={
						<>
							<p>We recommend completing the following units before continuing:</p>
							<ul className="p-0 mb-0">
								{dependencyCourseUnits.map((dependencyCourseUnit) => (
									<Link
										key={dependencyCourseUnit.courseUnitId}
										to={`/courses/${courseUrlName}/course-units/${dependencyCourseUnit.courseUnitId}`}
									>
										{dependencyCourseUnit.title}
									</Link>
								))}
							</ul>
						</>
					}
				/>
			)}

			<h2 className="mb-10">{courseUnit.title}</h2>
			{courseUnit.description && <WysiwygDisplay className="mb-8" html={courseUnit.description ?? ''} />}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.QUIZ ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.CARD_SORT ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.REORDER) &&
				courseUnit.screeningFlowId && (
					<div className={classes.screeningFlowOuter}>
						<ScreeningFlow
							screeningFlowParams={screeningFlowParams}
							onScreeningFlowComplete={onActivityComplete}
						/>
					</div>
				)}

			{courseUnit.courseUnitTypeId === CourseUnitTypeId.VIDEO && (
				<>
					{videoPlayerTimedOut && (
						<InlineAlert
							className="mb-4"
							variant="warning"
							title="Video is taking longer than usual to load."
							description="If the issue persists, try reloading your browser window."
							action={{
								title: 'Reload',
								onClick: () => window.location.reload(),
							}}
						/>
					)}
					<div className={classes.videoPlayerSupplementsOuter}>
						{!videoPlayerReady && <Loader className={classes.videoPlayerLoader} />}
						<div className={classNames(classes.videoPlayerOuter, { ready: videoPlayerReady })}>
							<div id="kaltura_player" style={{ width: '100%', height: '100%' }} />
						</div>
					</div>
				</>
			)}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.INFOGRAPHIC ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.HOMEWORK) && (
				<div className={classes.imageOuter}>
					<img src={courseUnit.imageUrl} alt="" />
				</div>
			)}

			<div className="pt-10 d-flex justify-content-end">
				<Button
					type="button"
					variant="light"
					className="d-flex align-items-center text-decoration-none pe-3"
					onClick={onSkipActivityButtonClick}
				>
					Skip Activity
					<RightChevron className="ms-1" />
				</Button>
			</div>
		</>
	);
};
