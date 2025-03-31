import React, { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getKalturaScriptForVideo } from '@/lib/utils';
import { CourseUnitModel, CourseUnitTypeId, CourseVideoModel } from '@/lib/models';
import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningFlow } from '@/components/screening-v2';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

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
				console.log(`Kaltura player event triggered: ${eventName}, event data: ${JSON.stringify(event)}`);
			},
		});

		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [courseUnit.courseUnitTypeId, courseUnit.videoId, courseVideos]);

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
				<p className="text-danger mb-0">TODO: Infographic and Homework</p>
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
