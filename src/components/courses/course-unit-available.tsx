import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	CourseUnitModel,
	CourseUnitTypeId,
	CourseVideoModel,
	UnitCompletionTypeId,
} from '@/lib/models';
import { analyticsService } from '@/lib/services';
import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningFlow } from '@/components/screening-v2';
import { CourseVideo } from '@/components/courses/course-video';
import { CourseDownloadable } from '@/components/courses/course-downloadable';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	screeningFlowOuter: {
		padding: 40,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			padding: 32,
		},
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
	onNextButtonClick(): void;
	onView?(courseUnit: CourseUnitModel): void;
	onCompletionThresholdPassed(courseUnit: CourseUnitModel): void;
}

export const CourseUnitAvailable = ({
	courseUrlName,
	courseSessionId,
	courseUnit,
	courseVideos,
	dependencyCourseUnits,
	onActivityComplete,
	onSkipActivityButtonClick,
	onNextButtonClick,
	onView,
	onCompletionThresholdPassed,
}: CourseUnitAvailableProps) => {
	const classes = useStyles();
	const screeningFlowParams = useMemo(
		() => ({ courseSessionId, screeningFlowId: courseUnit.screeningFlowId }),
		[courseSessionId, courseUnit.screeningFlowId]
	);
	const [isComplete, setIsComplete] = useState(false);

	const handleVideoPlayerEvent = useCallback(
		(eventName: string, eventPayload: unknown) => {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_COURSE_UNIT_VIDEO, {
				courseUnitId: courseUnit.courseUnitId,
				...(courseSessionId && { courseSessionId }),
				videoId: courseUnit.videoId,
				eventName,
				eventPayload,
			});
		},
		[courseSessionId, courseUnit.courseUnitId, courseUnit.videoId]
	);

	useEffect(() => {
		onView?.(courseUnit);
	}, [courseUnit, onView]);

	const handleUnitComplete = useCallback(() => {
		setIsComplete(true);
		onActivityComplete();
	}, [onActivityComplete]);

	const showNextButton = useMemo(() => {
		return (
			courseUnit.unitCompletionTypeId === UnitCompletionTypeId.IMMEDIATELY ||
			courseUnit.courseUnitTypeId === CourseUnitTypeId.VIDEO ||
			isComplete
		);
	}, [courseUnit.courseUnitTypeId, courseUnit.unitCompletionTypeId, isComplete]);

	const memoizedCompletionThresholdPassed = useCallback(() => {
		onCompletionThresholdPassed(courseUnit);
	}, [courseUnit, onCompletionThresholdPassed]);

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
					<div
						className={classNames({
							[classes.screeningFlowOuter]: courseUnit.courseUnitTypeId !== CourseUnitTypeId.CARD_SORT,
						})}
					>
						<ScreeningFlow
							cardSortOnly={courseUnit.courseUnitTypeId === CourseUnitTypeId.CARD_SORT}
							screeningFlowParams={screeningFlowParams}
							onScreeningFlowComplete={handleUnitComplete}
						/>
					</div>
				)}

			{courseUnit.courseUnitTypeId === CourseUnitTypeId.VIDEO && (
				<CourseVideo
					videoId={courseUnit.videoId ?? ''}
					courseVideos={courseVideos}
					onVideoPlayerEvent={handleVideoPlayerEvent}
					onVideoPlayerEnd={handleUnitComplete}
					completionThresholdInSeconds={courseUnit.completionThresholdInSeconds ?? 0}
					onCompletionThresholdPassed={memoizedCompletionThresholdPassed}
				/>
			)}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.INFOGRAPHIC ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.HOMEWORK ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.THINGS_TO_SHARE) && (
				<>
					{courseUnit.imageUrl && (
						<div
							className={classNames(classes.imageOuter, {
								'mb-8': (courseUnit.courseUnitDownloadableFiles ?? []).length > 0,
							})}
						>
							<img src={courseUnit.imageUrl} alt="" />
						</div>
					)}
				</>
			)}

			{(courseUnit.courseUnitDownloadableFiles ?? []).length > 0 && (
				<div>
					{(courseUnit.courseUnitDownloadableFiles ?? []).map(
						(courseUnitDownloadableFile, courseUnitDownloadableFileIndex) => {
							const isLast =
								(courseUnit.courseUnitDownloadableFiles ?? []).length - 1 ===
								courseUnitDownloadableFileIndex;

							return (
								<CourseDownloadable
									className={classNames({
										'mb-2': !isLast,
									})}
									key={courseUnitDownloadableFile.courseUnitDownloadableFileId}
									courseUnitDownloadableFile={courseUnitDownloadableFile}
									trackEvent={() => {
										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT_DOWNLOADABLE_FILE,
											{
												courseUnitId: courseUnit.courseUnitId,
												...(courseSessionId && { courseSessionId }),
												courseUnitDownloadableFileId:
													courseUnitDownloadableFile.courseUnitDownloadableFileId,
											}
										);
									}}
								/>
							);
						}
					)}
				</div>
			)}

			<div className="pt-10 d-flex justify-content-end">
				{showNextButton ? (
					<Button
						type="button"
						variant="primary"
						className="d-flex align-items-center text-decoration-none pe-3"
						onClick={onNextButtonClick}
					>
						Next
						<RightChevron className="ms-1" />
					</Button>
				) : (
					<Button
						type="button"
						variant="light"
						className="d-flex align-items-center text-decoration-none pe-3"
						onClick={onSkipActivityButtonClick}
					>
						Skip Activity
						<RightChevron className="ms-1" />
					</Button>
				)}
			</div>
		</>
	);
};
