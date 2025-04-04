import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import {
	getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession,
	getNextIncompleteAndNotStronglyLockedCourseUnitIdByCourseSession,
	getOptionalCourseModules,
	getRequiredCourseModules,
} from '@/lib/utils';
import {
	AnalyticsNativeEventTypeId,
	CourseModel,
	CourseModuleModel,
	CourseSessionUnitStatusId,
	CourseUnitDependencyTypeId,
	CourseUnitLockStatus,
	CourseUnitLockTypeId,
	CourseUnitModel,
} from '@/lib/models';
import { analyticsService, coursesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import {
	CourseModule,
	CourseUnitAvailable,
	CourseUnitComplete,
	CourseUnitHeader,
	CourseUnitLocked,
} from '@/components/courses';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as MenuIcon } from '@/assets/icons/icon-menu.svg';

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
	aside: {
		top: headerHeight,
		left: 0,
		bottom: 0,
		zIndex: 4,
		width: asideWidth,
		overflowY: 'auto',
		padding: '24px 16px',
		position: 'absolute',
		transition: '200ms transform',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			top: 0,
			maxWidth: '100%',
			transform: 'translateX(-100%)',
			'&.show': {
				transform: 'translateX(0%)',
			},
		},
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
		transition: '200ms left',
		backgroundColor: theme.colors.n75,
		[mediaQueries.lg]: {
			left: 0,
			padding: '24px 4px',
		},
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

	const [showAside, setShowAside] = useState(false);
	const [course, setCourse] = useState<CourseModel>();
	const [requiredModules, setRequiredModules] = useState<CourseModuleModel[]>([]);
	const [optionalModules, setOptionalModules] = useState<CourseModuleModel[]>([]);
	const [courseUnit, setCourseUnit] = useState<CourseUnitModel>();
	const [courseUnitLockStatus, setCourseUnitLockStatus] = useState<CourseUnitLockStatus>();
	const [courseUnitCompleted, setCourseUnitCompleted] = useState(false);
	const [courseUnitByCourseUnitId, setCourseUnitByCourseUnitId] = useState<Record<string, CourseUnitModel>>({});

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const { course: currentCourse } = await coursesService.getCourseDetail(courseIdentifier).fetch();
		const { currentCourseSession, courseModules, defaultCourseUnitLockStatusesByCourseUnitId } = currentCourse;

		const optionalCourseModuleIds = currentCourseSession?.optionalCourseModuleIds ?? [];
		const courseUnitLockStatusesByCourseUnitId = currentCourseSession
			? currentCourseSession.courseUnitLockStatusesByCourseUnitId
			: defaultCourseUnitLockStatusesByCourseUnitId;
		const courseUnitsFlat = courseModules.flatMap(({ courseUnits }) => courseUnits);
		const courseUnitMap: Record<string, CourseUnitModel> = courseUnitsFlat.reduce(
			(accumulator, courseUnit) => ({ ...accumulator, [courseUnit.courseUnitId]: courseUnit }),
			{}
		);
		const desiredCourseUnit = unitId ? courseUnitMap[unitId] : undefined;

		if (!desiredCourseUnit) {
			return;
		}

		const { courseUnitId } = desiredCourseUnit;
		const completionStatus = currentCourseSession?.courseSessionUnitStatusIdsByCourseUnitId?.[courseUnitId];
		const isCompleted =
			completionStatus === CourseSessionUnitStatusId.COMPLETED ||
			completionStatus === CourseSessionUnitStatusId.SKIPPED;

		setCourse(currentCourse);
		setRequiredModules(getRequiredCourseModules(courseModules, optionalCourseModuleIds));
		setOptionalModules(getOptionalCourseModules(courseModules, optionalCourseModuleIds));
		setCourseUnit(desiredCourseUnit);
		setCourseUnitLockStatus(courseUnitLockStatusesByCourseUnitId[courseUnitId]);
		setCourseUnitCompleted(isCompleted);
		setCourseUnitByCourseUnitId(courseUnitMap);

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_COURSE_UNIT, {
			courseUnitId: desiredCourseUnit.courseUnitId,
			...(currentCourseSession?.courseSessionId && {
				courseSessionId: currentCourseSession.courseSessionId,
			}),
		});
	}, [courseIdentifier, unitId]);

	const navigateToNextAvailableUnit = useCallback(
		(currentCourse: CourseModel) => {
			if (!currentCourse.currentCourseSession) {
				navigate(`/courses/${currentCourse.urlName}`);
				return;
			}

			const desiredUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(
				currentCourse.courseModules,
				currentCourse.currentCourseSession
			);

			if (desiredUnitId) {
				navigate(`/courses/${currentCourse.urlName}/course-units/${desiredUnitId}`);
			} else {
				navigate(`/courses/${currentCourse.urlName}`);
			}
		},
		[navigate]
	);

	const handleActivityComplete = useCallback(async () => {
		fetchData();
	}, [fetchData]);

	const handleSkipActivityButtonClick = useCallback(() => {
		try {
			if (!course) {
				throw new Error('course is undefined.');
			}

			if (!courseUnit) {
				throw new Error('courseUnit is undefined.');
			}

			if (!course.currentCourseSession) {
				throw new Error('course.currentCourseSession is undefined.');
			}

			const { courseModules, currentCourseSession, urlName, courseId } = course;
			const desiredUnitId = getNextIncompleteAndNotStronglyLockedCourseUnitIdByCourseSession(
				courseUnit,
				courseModules,
				currentCourseSession
			);

			if (desiredUnitId) {
				navigate(`/courses/${urlName}/course-units/${desiredUnitId}`);
			} else {
				navigate(`/courses/${urlName}`);
			}

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT_SKIP, {
				courseId,
				...(currentCourseSession && {
					courseSessionId: currentCourseSession.courseSessionId,
				}),
				courseUnitId: courseUnit.courseUnitId,
			});
		} catch (error) {
			handleError(error);
		}
	}, [course, courseUnit, handleError, navigate]);

	const handleCompletedUnitNextButtonClick = useCallback(() => {
		if (!course) {
			throw new Error('course is undefined.');
		}

		navigateToNextAvailableUnit(course);
	}, [course, navigateToNextAvailableUnit]);

	const courseUnitIsStronglyLocked = useMemo(
		() => courseUnitLockStatus?.courseUnitLockTypeId === CourseUnitLockTypeId.STRONGLY_LOCKED,
		[courseUnitLockStatus?.courseUnitLockTypeId]
	);

	const strongCourseUnitDependencies = useMemo(
		() =>
			(
				courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds[CourseUnitDependencyTypeId.STRONG] ??
				[]
			).map((dependencyUnitId) => courseUnitByCourseUnitId[dependencyUnitId]),
		[courseUnitByCourseUnitId, courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds]
	);

	const weakCourseUnitDependencies = useMemo(
		() =>
			(
				courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds[CourseUnitDependencyTypeId.WEAK] ?? []
			).map((dependencyUnitId) => courseUnitByCourseUnitId[dependencyUnitId]),
		[courseUnitByCourseUnitId, courseUnitLockStatus?.determinantCourseUnitIdsByDependencyTypeIds]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Session</title>
			</Helmet>
			<div className={classes.wrapper}>
				{course && <CourseUnitHeader height={headerHeight} course={course} />}
				<div
					className={classNames(classes.aside, {
						show: showAside,
					})}
				>
					<div className="d-lg-none mb-4 d-flex justify-content-end">
						<Button
							variant="link"
							className="d-flex align-items-center text-decoration-none"
							onClick={() => {
								setShowAside((previousValue) => !previousValue);
							}}
						>
							<CloseIcon width={16} height={16} className="me-1" />
							Close
						</Button>
					</div>
					{course &&
						requiredModules.map((courseModule) => (
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
								onCourseUnitClick={(desiredCourseUnit) => {
									navigate(
										`/courses/${course.urlName}/course-units/${desiredCourseUnit.courseUnitId}`
									);

									if (!courseUnit) {
										return;
									}

									analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT, {
										courseId: course.courseId,
										...(course.currentCourseSession && {
											courseSessionId: course.currentCourseSession.courseSessionId,
										}),
										courseUnitId: desiredCourseUnit.courseUnitId,
										source: 'COURSE_UNIT',
										sourceCourseUnitId: courseUnit.courseUnitId,
									});
								}}
							/>
						))}
					{optionalModules.length > 0 && (
						<>
							<hr className="my-4" />
							<h6 className="px-4 pt-4 pb-1 small fw-bold text-uppercase text-n500">Optional Modules</h6>
							{course &&
								optionalModules.map((courseModule) => (
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
										onCourseUnitClick={(desiredCourseUnit) => {
											navigate(
												`/courses/${course.urlName}/course-units/${desiredCourseUnit.courseUnitId}`
											);

											if (!courseUnit) {
												return;
											}

											analyticsService.persistEvent(
												AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT,
												{
													courseId: course.courseId,
													...(course.currentCourseSession && {
														courseSessionId: course.currentCourseSession.courseSessionId,
													}),
													courseUnitId: desiredCourseUnit.courseUnitId,
													source: 'COURSE_UNIT',
													sourceCourseUnitId: courseUnit.courseUnitId,
												}
											);
										}}
									/>
								))}
						</>
					)}
				</div>
				<div className={classes.previewPane}>
					<AsyncWrapper fetchData={fetchData}>
						<Container>
							<Row className="d-block d-lg-none mb-6">
								<Col lg={12} xl={{ offset: 1, span: 10 }} xxl={{ offset: 2, span: 8 }}>
									<Button
										variant="link"
										className="px-0 d-flex align-items-center text-decoration-none"
										onClick={() => {
											setShowAside((previousValue) => !previousValue);
										}}
									>
										<MenuIcon className="me-1" />
										Course Content
									</Button>
								</Col>
							</Row>
							<Row>
								<Col lg={12} xl={{ offset: 1, span: 10 }} xxl={{ offset: 2, span: 8 }}>
									{courseUnitCompleted ? (
										<>
											{courseUnit && (
												<CourseUnitComplete
													courseUnit={courseUnit}
													onRestartActivityButtonClick={() => {
														setCourseUnitCompleted(false);
													}}
													onNextButtonClick={handleCompletedUnitNextButtonClick}
												/>
											)}
										</>
									) : (
										<>
											{courseUnitIsStronglyLocked ? (
												<>
													{course && courseUnit && (
														<CourseUnitLocked
															courseUrlName={course.urlName}
															courseUnit={courseUnit}
															dependencyCourseUnits={strongCourseUnitDependencies}
														/>
													)}
												</>
											) : (
												<>
													{course && course.currentCourseSession && courseUnit && (
														<CourseUnitAvailable
															courseUrlName={course.urlName}
															courseSessionId={
																course.currentCourseSession?.courseSessionId
															}
															courseVideos={course.videos}
															courseUnit={courseUnit}
															dependencyCourseUnits={weakCourseUnitDependencies}
															onActivityComplete={handleActivityComplete}
															onSkipActivityButtonClick={handleSkipActivityButtonClick}
														/>
													)}
												</>
											)}
										</>
									)}
								</Col>
							</Row>
						</Container>
					</AsyncWrapper>
				</div>
			</div>
		</>
	);
};
