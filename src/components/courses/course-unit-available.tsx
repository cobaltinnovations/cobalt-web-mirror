import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getKalturaScriptForVideo } from '@/lib/utils';
import { AnalyticsNativeEventTypeId, CourseUnitModel, CourseUnitTypeId, CourseVideoModel } from '@/lib/models';
import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningFlow } from '@/components/screening-v2';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { analyticsService } from '@/lib/services';
import { throttle } from 'lodash';

const useStyles = createUseThemedStyles((theme) => ({
	videoPlayerOuter: {
		width: '100%',
		aspectRatio: '16/9',
		borderRadius: 8,
		overflow: 'hidden',
	},
	screeningFlowOuter: {
		padding: 40,
		borderRadius: 12,
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

		const { script } = getKalturaScriptForVideo({
			videoPlayerId: 'kaltura_player',
			courseVideo: video,
			eventCallback: (eventName, event) => {
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
				<div className={classes.videoPlayerOuter}>
					<div id="kaltura_player" style={{ width: '100%', height: '100%' }} />
				</div>
			)}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.INFOGRAPHIC ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.HOMEWORK) && (
				<>
					<div className={classes.imageOuter}>
						<img src={courseUnit.imageUrl} alt="" />
					</div>
					<object data={courseUnit.imageUrl} type="application/pdf" width="100%" height={400}>
						<p>
							<a href={courseUnit.imageUrl}>View PDF</a>
						</p>
					</object>
				</>
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
