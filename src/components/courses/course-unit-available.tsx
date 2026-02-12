import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	Content,
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
import { Confetti } from '@/components/confetti';
import SvgIcon from '@/components/svg-icon';
import ResourceLibraryCard from '@/components/resource-library-card';
import { createUseThemedStyles } from '@/jss/theme';
import { CourseVideoEventPlaybackTime } from '@/lib/utils';

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
	courseUnitDescription: {
		'& p': {
			...theme.fonts.large,
		},
	},
}));

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
};

const getRecordStringValue = (record: Record<string, unknown> | undefined, key: string): string | undefined => {
	if (!record) {
		return undefined;
	}

	const value = record[key];
	return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
};

const getKalturaEntryIdFromVideoEvent = (mediaProxy: unknown, eventPayload: unknown): string | undefined => {
	const mediaProxyRecord = asRecord(mediaProxy);
	const mediaProxyEntryId = getRecordStringValue(mediaProxyRecord, 'entryId');
	if (mediaProxyEntryId) {
		return mediaProxyEntryId;
	}

	const payloadRecord = asRecord(eventPayload);
	if (!payloadRecord) {
		return undefined;
	}

	const payloadEntryId = getRecordStringValue(payloadRecord, 'entryId');
	if (payloadEntryId) {
		return payloadEntryId;
	}

	const candidateRecords = [
		asRecord(payloadRecord.mediaInfo),
		asRecord(payloadRecord.item),
		asRecord(payloadRecord.currentItem),
		asRecord(payloadRecord.nextItem),
		asRecord(payloadRecord.previousItem),
	];

	for (const candidateRecord of candidateRecords) {
		const candidateEntryId =
			getRecordStringValue(candidateRecord, 'entryId') ?? getRecordStringValue(candidateRecord, 'id');
		if (candidateEntryId) {
			return candidateEntryId;
		}
	}

	return undefined;
};

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
	courseUnitContent: Content[];
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
	courseUnitContent,
}: CourseUnitAvailableProps) => {
	const classes = useStyles();
	const screeningFlowParams = useMemo(
		() => ({ courseSessionId, screeningFlowId: courseUnit.screeningFlowId }),
		[courseSessionId, courseUnit.screeningFlowId]
	);
	const [isComplete, setIsComplete] = useState(false);
	const currentKalturaEntryIdRef = useRef<string>();

	const handleVideoPlayerEvent = useCallback(
		(
			eventName: string,
			eventPayload: unknown,
			mediaProxy: unknown,
			eventPlaybackTime?: CourseVideoEventPlaybackTime
		) => {
			const currentEventKalturaEntryId = getKalturaEntryIdFromVideoEvent(mediaProxy, eventPayload);
			if (currentEventKalturaEntryId) {
				currentKalturaEntryIdRef.current = currentEventKalturaEntryId;
			}

			const currentlyPlayingKalturaEntryId = currentEventKalturaEntryId ?? currentKalturaEntryIdRef.current;

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_COURSE_UNIT_VIDEO, {
				courseUnitId: courseUnit.courseUnitId,
				...(courseSessionId && { courseSessionId }),
				videoId: courseUnit.videoId,
				currentlyPlayingVideoId: courseUnit.videoId,
				...(currentlyPlayingKalturaEntryId ? { currentlyPlayingKalturaEntryId } : {}),
				eventName,
				eventPayload,
				...(mediaProxy ? { mediaProxy } : {}),
				...(eventPlaybackTime ? { eventPlaybackTime } : {}),
			});
		},
		[courseSessionId, courseUnit.courseUnitId, courseUnit.videoId]
	);

	useEffect(() => {
		currentKalturaEntryIdRef.current = undefined;
	}, [courseUnit.videoId]);

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
			{courseUnit.description && (
				<WysiwygDisplay
					className={classNames('mb-8', classes.courseUnitDescription)}
					html={courseUnit.description ?? ''}
				/>
			)}

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
					completionThresholdInSeconds={courseUnit.completionThresholdInSeconds ?? 0}
					onCompletionThresholdPassed={memoizedCompletionThresholdPassed}
				/>
			)}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.INFOGRAPHIC ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.HOMEWORK ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.THINGS_TO_SHARE ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.FINAL) && (
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

			{courseUnitContent.length > 0 && (
				<Row>
					{courseUnitContent.map((content) => {
						return (
							<Col xs={12} sm={12} md={6} lg={6} key={content.contentId} className="mb-8">
								<ResourceLibraryCard
									key={content.contentId}
									linkTo={`/resource-library/${content.contentId}`}
									className="h-100"
									imageUrl={content.imageUrl}
									badgeTitle={content.newFlag ? 'New' : ''}
									title={content.title}
									author={content.author}
									description={content.description}
									tags={[]}
									contentTypeId={content.contentTypeId}
									duration={content.durationInMinutesDescription}
									trackEvent={() => {
										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT_CONTENT,
											{
												courseSessionId: courseSessionId,
												courseUnitId: courseUnit.courseUnitId,
												contentId: content.contentId,
											}
										);
									}}
									trackTagEvent={(_tag) => {
										return;
									}}
								/>
							</Col>
						);
					})}
				</Row>
			)}

			{courseUnit.courseUnitTypeId === CourseUnitTypeId.FINAL && (
				<>
					<Confetti
						particleCount={40}
						launchSpeed={2.5}
						deg={-70}
						x={0}
						y={1}
						spreadDeg={20}
						shapeSize={20}
					/>
					<Confetti
						particleCount={40}
						launchSpeed={2.5}
						deg={-110}
						x={1}
						y={1}
						spreadDeg={20}
						shapeSize={20}
					/>
				</>
			)}

			<div className="pt-10 d-flex justify-content-end">
				{showNextButton ? (
					<Button
						type="button"
						variant="primary"
						className="d-flex align-items-center text-decoration-none pe-3"
						onClick={onNextButtonClick}
					>
						{courseUnit.courseUnitTypeId === CourseUnitTypeId.FINAL ? 'Go to course home' : 'Next'}
						<SvgIcon kit="far" icon="chevron-right" size={16} className="ms-1" />
					</Button>
				) : (
					<Button
						type="button"
						variant="light"
						className="d-flex align-items-center text-decoration-none pe-3"
						onClick={onSkipActivityButtonClick}
					>
						Skip Activity
						<SvgIcon kit="far" icon="chevron-right" size={16} className="ms-1" />
					</Button>
				)}
			</div>
		</>
	);
};
