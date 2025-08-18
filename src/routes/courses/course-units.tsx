import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import {
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
	CourseUnitTypeId,
	UnitCompletionTypeId,
} from '@/lib/models';
import { analyticsService, coursesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import {
	CourseModule,
	CourseUnitAvailable,
	CourseUnitComplete,
	CourseUnitLayout,
	CourseUnitLocked,
} from '@/components/courses';
import SvgIcon from '@/components/svg-icon';

export async function loader() {
	return null;
}

export const Component = () => {
	const handleError = useHandleError();
	const { courseIdentifier, unitId } = useParams<{ courseIdentifier: string; unitId: string }>();
	const navigate = useNavigate();

	const [showMenu, setShowMenu] = useState(false);
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

			if (!courseUnit) {
				throw new Error('courseUnit is undefined.');
			}

			const desiredUnitId = getNextIncompleteAndNotStronglyLockedCourseUnitIdByCourseSession(
				courseUnit,
				currentCourse.courseModules,
				currentCourse.currentCourseSession
			);

			if (desiredUnitId) {
				navigate(`/courses/${currentCourse.urlName}/course-units/${desiredUnitId}`);
			} else {
				navigate(`/courses/${currentCourse.urlName}`);
			}
		},
		[courseUnit, navigate]
	);

	const handleActivityComplete = useCallback(async () => {
		// Do not automatically refresh the view when a user completes a card sort
		// Refreshing the data causes the "activity complete" state to appear
		// Users need time to review their feedback
		if (courseUnit?.courseUnitTypeId === CourseUnitTypeId.CARD_SORT) {
			return;
		}

		fetchData();
	}, [courseUnit?.courseUnitTypeId, fetchData]);

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

	const handleCourseUnitView = useCallback(
		async (viewedCourseUnit: CourseUnitModel) => {
			if (viewedCourseUnit.unitCompletionTypeId !== UnitCompletionTypeId.IMMEDIATELY) {
				return;
			}

			try {
				await coursesService.completeCourseUnit(viewedCourseUnit.courseUnitId).fetch();
			} catch (error) {
				handleError(error);
			}
		},
		[handleError]
	);

	const handleCompletionThresholdPassed = useCallback(
		async (viewedCourseUnit: CourseUnitModel) => {
			if (viewedCourseUnit.unitCompletionTypeId !== UnitCompletionTypeId.COMPLETION_THRESHOLD_IN_SECONDS) {
				return;
			}

			try {
				await coursesService.completeCourseUnit(viewedCourseUnit.courseUnitId).fetch();
			} catch (error) {
				handleError(error);
			}
		},
		[handleError]
	);

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

			<CourseUnitLayout
				title={course?.title}
				showMenu={showMenu}
				onShowMenuToggle={setShowMenu}
				onExitButtonClick={() => {
					navigate(`/courses/${course?.urlName}`);
				}}
				onNeedHelpButtonClick={() => {
					navigate('/feedback');
				}}
				menuElement={
					<>
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
						{optionalModules.length > 0 && (
							<>
								<hr className="my-4" />
								<h6 className="px-4 pt-4 pb-1 small fw-bold text-uppercase text-n500">
									Optional Modules
								</h6>
								{course &&
									optionalModules.map((courseModule) => (
										<CourseModule
											compact
											activeCourseUnitId={unitId}
											key={courseModule.courseModuleId}
											courseModule={courseModule}
											courseSessionUnitStatusIdsByCourseUnitId={
												course.currentCourseSession
													? course.currentCourseSession
															.courseSessionUnitStatusIdsByCourseUnitId
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
															courseSessionId:
																course.currentCourseSession.courseSessionId,
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
					</>
				}
			>
				<AsyncWrapper fetchData={fetchData}>
					<Container>
						<Row className="d-block d-lg-none mb-6">
							<Col lg={12} xl={{ offset: 1, span: 10 }} xxl={{ offset: 2, span: 8 }}>
								<Button
									variant="link"
									className="px-0 d-flex align-items-center text-decoration-none"
									onClick={() => {
										setShowMenu(true);
									}}
								>
									<SvgIcon kit="fas" icon="bars" size={20} className="me-1 flex-shrink-0" />
									Course Content
								</Button>
							</Col>
						</Row>
						{course && courseUnit && (
							<Row>
								<Col lg={12} xl={{ offset: 1, span: 10 }} xxl={{ offset: 2, span: 8 }}>
									{courseUnitCompleted && courseUnit.showRestartActivityWhenComplete ? (
										<CourseUnitComplete
											courseUnit={courseUnit}
											onRestartActivityButtonClick={() => {
												setCourseUnitCompleted(false);
											}}
											onNextButtonClick={handleCompletedUnitNextButtonClick}
										/>
									) : (
										<>
											{courseUnitIsStronglyLocked ? (
												<CourseUnitLocked
													courseUrlName={course.urlName}
													courseUnit={courseUnit}
													dependencyCourseUnits={strongCourseUnitDependencies}
												/>
											) : (
												<>
													{course.currentCourseSession && (
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
															onNextButtonClick={handleCompletedUnitNextButtonClick}
															onView={handleCourseUnitView}
															onCompletionThresholdPassed={
																handleCompletionThresholdPassed
															}
														/>
													)}
												</>
											)}
										</>
									)}
								</Col>
							</Row>
						)}
					</Container>
				</AsyncWrapper>
			</CourseUnitLayout>
		</>
	);
};
