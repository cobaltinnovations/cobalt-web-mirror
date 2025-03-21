import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
	CourseModel,
	CourseUnitLockStatus,
	CourseUnitLockTypeId,
	CourseUnitModel,
	CourseUnitTypeId,
} from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { ScreeningFlow } from '@/components/screening-v2';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { CourseModule } from '@/components/courses';
import { createUseThemedStyles } from '@/jss/theme';
import useHandleError from '@/hooks/use-handle-error';
import { getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession } from '@/lib/utils';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';

const headerHeight = 60;
const asideWidth = 344;

const useStyles = createUseThemedStyles((theme) => ({
	wrapper: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		position: 'fixed',
	},
	header: {
		top: 0,
		left: 0,
		right: 0,
		height: headerHeight,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	aside: {
		top: headerHeight,
		left: 0,
		bottom: 0,
		zIndex: 2,
		width: asideWidth,
		overflowY: 'auto',
		padding: '24px 16px',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	previewPane: {
		top: headerHeight,
		left: asideWidth,
		right: 0,
		bottom: 0,
		zIndex: 0,
		padding: 24,
		overflowY: 'auto',
		position: 'absolute',
		backgroundColor: theme.colors.n75,
	},
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { courseIdentifier, unitId } = useParams<{ courseIdentifier: string; unitId: string }>();
	const navigate = useNavigate();
	const [course, setCourse] = useState<CourseModel>();

	const [courseUnit, setCourseUnit] = useState<CourseUnitModel>();
	const [courseUnitLockStatus, setCourseUnitLockStatus] = useState<CourseUnitLockStatus>();

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const response = await coursesService.getCourseDetail(courseIdentifier).fetch();
		const lockStatuses = response.course.currentCourseSession
			? response.course.currentCourseSession.courseUnitLockStatusesByCourseUnitId
			: response.course.defaultCourseUnitLockStatusesByCourseUnitId;
		const courseUnitsFlat = response.course.courseModules.map((courseModule) => courseModule.courseUnits).flat();
		const desiredCourseUnit = courseUnitsFlat.find((cu) => cu.courseUnitId === unitId);
		const desiredCourseUnitLockStatus = desiredCourseUnit
			? lockStatuses[desiredCourseUnit.courseUnitId]
			: undefined;

		setCourse(response.course);
		setCourseUnit(desiredCourseUnit);
		setCourseUnitLockStatus(desiredCourseUnitLockStatus);
	}, [courseIdentifier, unitId]);

	useEffect(() => {
		if (courseUnit?.courseUnitTypeId !== CourseUnitTypeId.VIDEO) {
			return;
		}

		const video = course?.videos.find((v) => v.videoId === courseUnit.videoId);

		if (!video) {
			return;
		}

		const apiScript = document.createElement('script');
		apiScript.src = `//cdnapisec.kaltura.com/p/${video?.kalturaPartnerId}/sp/${video.kalturaPartnerId}00/embedIframeJs/uiconf_id/${video.kalturaUiconfId}/partner_id/${video.kalturaPartnerId}`;
		apiScript.async = true;
		apiScript.onload = () => {
			document.body.appendChild(embedScript);
		};

		const embedScript = document.createElement('script');
		embedScript.type = 'text/javascript';
		embedScript.async = true;
		embedScript.text = `kWidget.embed({
			'targetId': 'kaltura_player',
			'wid': '${video.kalturaWid}',
			'uiconf_id' : '${video.kalturaUiconfId}',
			'entry_id' : '${video.kalturaEntryId}',
			'readyCallback': function(playerID) {
				var kdp = document.getElementById(playerID);
				var events = ['layoutBuildDone', 'playerReady',  'mediaLoaded', 'mediaError', 'playerStateChange', 'firstPlay', 'playerPlayed', 'playerPaused', 'preSeek', 'seek', 'seeked', 'playerUpdatePlayhead', 'openFullScreen', 'closeFullScreen', 'volumeChanged', 'mute', 'unmute', 'bufferChange', 'cuePointReached', 'playerPlayEnd', 'onChangeMedia', 'onChangeMediaDone'];
				for ( var i=0; i < events.length; i++ ){
					(function(i) {
						kdp.kBind( events[i], function(event){
							console.log('Kaltura player event triggered: ' + events[i] + ', event data: ' + JSON.stringify(event));
						});
					})(i);
				}
			}
		});`;

		document.body.appendChild(apiScript);

		return () => {
			document.body.removeChild(apiScript);
			document.body.removeChild(embedScript);
		};
	}, [course?.videos, courseUnit?.courseUnitTypeId, courseUnit?.videoId]);

	const handleMarkCourseUnitCompleteButtonClick = useCallback(async () => {
		try {
			if (!course) {
				throw new Error('course is undefined.');
			}

			if (!courseUnit) {
				throw new Error('courseUnit is undefined.');
			}

			const { courseSession } = await coursesService.completeCourseUnit(courseUnit.courseUnitId).fetch();
			const desiredUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(courseSession);

			if (!desiredUnitId) {
				navigate(`/courses/${course.urlName}`);
				return;
			}

			navigate(`/courses/${course.urlName}/course-units/${desiredUnitId}`);
		} catch (error) {
			handleError(error);
		}
	}, [course, courseUnit, handleError, navigate]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Session</title>
			</Helmet>
			<AsyncWrapper fetchData={fetchData}>
				<div className={classes.wrapper}>
					<div className={classes.header}>
						<div>
							<Button
								className="me-2"
								onClick={() => {
									navigate(`/courses/${course?.urlName}`);
								}}
							>
								Go Back
							</Button>
							<span className="fs-large fw-bold">{course?.title}</span>
						</div>
						<Button
							variant="link"
							className="d-flex align-items-center text-decoration-none"
							onClick={() => {
								navigate('/feedback');
							}}
						>
							<QuestionMarkIcon className="me-1" width={20} height={20} />
							Need Help?
						</Button>
					</div>
					<div className={classes.aside}>
						{course &&
							(course.courseModules ?? []).map((courseModule) => (
								<CourseModule
									compact
									activeCourseUnitId={unitId}
									key={courseModule.courseModuleId}
									courseModule={courseModule}
									courseSessionUnitStatusIdsByCourseUnitId={
										course.currentCourseSession
											? course.currentCourseSession.courseSessionUnitStatusIdsByCourseUnitId
											: {}
									}
									courseUnitLockStatusesByCourseUnitId={
										course.currentCourseSession
											? course.currentCourseSession.courseUnitLockStatusesByCourseUnitId
											: course.defaultCourseUnitLockStatusesByCourseUnitId
									}
									onCourseUnitClick={(courseUnit) => {
										navigate(`/courses/${course.urlName}/course-units/${courseUnit.courseUnitId}`);
									}}
								/>
							))}
					</div>
					<div className={classes.previewPane}>
						<Container>
							<Row>
								<Col md={12} lg={{ offset: 1, span: 10 }}>
									{courseUnitLockStatus?.courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED ? (
										<>
											{courseUnit?.courseUnitTypeId === CourseUnitTypeId.QUIZ &&
												courseUnit?.screeningFlowId && (
													<ScreeningFlow
														screeningFlowId={courseUnit.screeningFlowId}
														onScreeningFlowComplete={(screeningSessionDestination) => {
															window.alert(
																'[TODO]: handle screening complete, check console log.'
															);
															console.log(
																'[TODO]: screening flow complete, load next unit',
																screeningSessionDestination
															);
														}}
													/>
												)}
											{courseUnit?.courseUnitTypeId === CourseUnitTypeId.VIDEO && (
												<div id="kaltura_player" style={{ width: 400, height: 330 }} />
											)}

											<Button onClick={handleMarkCourseUnitCompleteButtonClick}>
												Mark Complete
											</Button>
										</>
									) : (
										<>
											<h2>{courseUnitLockStatus?.courseUnitLockTypeId}</h2>
											{Object.entries(
												courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds ?? {}
											).map(([k, v]) => (
												<p>
													{k}: {v}
												</p>
											))}
										</>
									)}
								</Col>
							</Row>
						</Container>
					</div>
				</div>
			</AsyncWrapper>
		</>
	);
};
