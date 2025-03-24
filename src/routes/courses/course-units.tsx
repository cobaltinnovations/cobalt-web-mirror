import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
	CourseModel,
	CourseUnitDependencyTypeId,
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
import { getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession, getKalturaScriptForVideo } from '@/lib/utils';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import InlineAlert from '@/components/inline-alert';

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
		overflowY: 'auto',
		padding: '40px 24px',
		position: 'absolute',
		backgroundColor: theme.colors.n75,
	},
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
	const [courseUnitByUnitId, setCourseUnitByUnitId] = useState<Record<string, CourseUnitModel>>({});

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
		setCourseUnitByUnitId(
			courseUnitsFlat.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[currentValue.courseUnitId]: currentValue,
				}),
				{}
			)
		);
	}, [courseIdentifier, unitId]);

	useEffect(() => {
		if (courseUnit?.courseUnitTypeId !== CourseUnitTypeId.VIDEO) {
			return;
		}
		const video = course?.videos.find((v) => v.videoId === courseUnit.videoId);
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

	const strongCourseUnitDependencies = useMemo(
		() =>
			(
				courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds[CourseUnitDependencyTypeId.STRONG] ??
				[]
			).map((dependencyUnitId) => courseUnitByUnitId[dependencyUnitId]),
		[courseUnitByUnitId, courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds]
	);
	const weakCourseUnitDependencies = useMemo(
		() =>
			(
				courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds[CourseUnitDependencyTypeId.WEAK] ?? []
			).map((dependencyUnitId) => courseUnitByUnitId[dependencyUnitId]),
		[courseUnitByUnitId, courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds]
	);

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
								<Col md={12} lg={{ offset: 2, span: 8 }}>
									{courseUnitLockStatus?.courseUnitLockTypeId !==
									CourseUnitLockTypeId.STRONGLY_LOCKED ? (
										<>
											{weakCourseUnitDependencies.length > 0 && (
												<InlineAlert
													className="mb-10"
													variant="warning"
													title="Recommended learning path"
													description={
														<>
															<p>
																We recommend completing the following units before
																continuing:
															</p>
															<ul className="p-0 mb-0">
																{weakCourseUnitDependencies.map(
																	(dependencyCourseUnit) => (
																		<Link
																			to={`/courses/${course?.urlName}/course-units/${dependencyCourseUnit.courseUnitId}`}
																		>
																			{dependencyCourseUnit.title}
																		</Link>
																	)
																)}
															</ul>
														</>
													}
												/>
											)}
											<h2 className="mb-10">{courseUnit?.title}</h2>
											{courseUnit?.description && (
												<WysiwygDisplay className="mb-8" html={courseUnit?.description ?? ''} />
											)}
											{courseUnit?.courseUnitTypeId === CourseUnitTypeId.QUIZ &&
												courseUnit?.screeningFlowId && (
													<div className={classes.screeningFlowOuter}>
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
													</div>
												)}
											{courseUnit?.courseUnitTypeId === CourseUnitTypeId.VIDEO && (
												<div className={classes.videoPlayerOuter}>
													<div
														id="kaltura_player"
														style={{ width: '100%', height: '100%' }}
													/>
												</div>
											)}
											<div className="pt-10 text-right">
												<Button
													variant="light"
													onClick={handleMarkCourseUnitCompleteButtonClick}
												>
													Mark Complete
												</Button>
											</div>
										</>
									) : (
										<>
											<h2 className="mb-10">{courseUnit?.title}</h2>
											<h3 className="mb-6">This unit is locked</h3>
											<p className="fs-large mb-6">
												Please complete the following modules to unlock this unit:
											</p>
											<ul>
												{strongCourseUnitDependencies.map((dependencyCourseUnit) => (
													<li key={dependencyCourseUnit.courseUnitId}>
														<Link
															to={`/courses/${course?.urlName}/course-units/${dependencyCourseUnit.courseUnitId}`}
														>
															{dependencyCourseUnit.title}
														</Link>
													</li>
												))}
											</ul>
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
