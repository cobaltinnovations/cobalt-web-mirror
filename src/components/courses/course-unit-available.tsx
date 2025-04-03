import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AnalyticsNativeEventTypeId, CourseUnitModel, CourseUnitTypeId, CourseVideoModel } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningFlow } from '@/components/screening-v2';
import { CourseVideo } from '@/components/courses/course-video';
import { CourseDownloadable } from '@/components/courses/course-downloadable';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import classNames from 'classnames';

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
							onScreeningFlowComplete={onActivityComplete}
						/>
					</div>
				)}

			{courseUnit.courseUnitTypeId === CourseUnitTypeId.VIDEO && (
				<CourseVideo
					videoId={courseUnit.videoId ?? ''}
					courseVideos={courseVideos}
					onVideoPlayerEvent={(eventName, eventPayload) => {
						analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_COURSE_UNIT_VIDEO, {
							courseUnitId: courseUnit.courseUnitId,
							...(courseSessionId && { courseSessionId }),
							videoId: courseUnit.videoId,
							eventName,
							eventPayload,
						});
					}}
				/>
			)}

			{(courseUnit.courseUnitTypeId === CourseUnitTypeId.INFOGRAPHIC ||
				courseUnit.courseUnitTypeId === CourseUnitTypeId.HOMEWORK) && (
				<div className={classes.imageOuter}>
					<img src={courseUnit.imageUrl} alt="" />
				</div>
			)}

			{(courseUnit.courseUnitDownloadableFiles ?? []).map((courseUnitDownloadableFile) => (
				<CourseDownloadable
					key={courseUnitDownloadableFile.courseUnitDownloadableFileId}
					courseUnitDownloadableFile={courseUnitDownloadableFile}
					trackEvent={() => {
						analyticsService.persistEvent(
							AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT_DOWNLOADABLE_FILE,
							{
								courseUnitId: courseUnit.courseUnitId,
								...(courseSessionId && { courseSessionId }),
								courseUnitDownloadableFileId: courseUnitDownloadableFile.courseUnitDownloadableFileId,
							}
						);
					}}
				/>
			))}

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
