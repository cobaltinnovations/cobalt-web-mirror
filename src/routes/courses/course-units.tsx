import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
	CourseModel,
	CourseModuleModel,
	CourseSessionModel,
	CourseSessionUnitStatusId,
	CourseUnitDependencyTypeId,
	CourseUnitLockStatus,
	CourseUnitLockTypeId,
	CourseUnitModel,
} from '@/lib/models';
import { getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession } from '@/lib/utils';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { CourseModule, CourseUnitAvailable, CourseUnitComplete, CourseUnitLocked } from '@/components/courses';
import { createUseThemedStyles } from '@/jss/theme';
import useHandleError from '@/hooks/use-handle-error';
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
		overflowY: 'auto',
		padding: '40px 24px',
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
	const [requiredModules, setRequiredModules] = useState<CourseModuleModel[]>([]);
	const [optionalModules, setOptionalModules] = useState<CourseModuleModel[]>([]);
	const [courseUnit, setCourseUnit] = useState<CourseUnitModel>();
	const [courseUnitLockStatus, setCourseUnitLockStatus] = useState<CourseUnitLockStatus>();
	const [courseUnitCompleted, setCourseUnitCompleted] = useState(false);
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
		const desiredCourseUnitCompletionStatus = desiredCourseUnit
			? response.course.currentCourseSession?.courseSessionUnitStatusIdsByCourseUnitId[
					desiredCourseUnit.courseUnitId
			  ]
			: undefined;

		setCourse(response.course);
		setRequiredModules(
			response.course.courseModules.filter(
				(cm) =>
					!(response.course.currentCourseSession?.optionalCourseModuleIds ?? []).includes(cm.courseModuleId)
			)
		);
		setOptionalModules(
			response.course.courseModules.filter((cm) =>
				(response.course.currentCourseSession?.optionalCourseModuleIds ?? []).includes(cm.courseModuleId)
			)
		);
		setCourseUnit(desiredCourseUnit);
		setCourseUnitLockStatus(desiredCourseUnitLockStatus);
		setCourseUnitCompleted(
			desiredCourseUnitCompletionStatus === CourseSessionUnitStatusId.COMPLETED ||
				desiredCourseUnitCompletionStatus === CourseSessionUnitStatusId.SKIPPED
		);
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

	const navigateToNextAvailableUnit = useCallback(
		(course: CourseModel, courseSession: CourseSessionModel) => {
			const desiredUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(courseSession);

			if (!desiredUnitId) {
				navigate(`/courses/${course.urlName}`);
				return;
			}

			navigate(`/courses/${course.urlName}/course-units/${desiredUnitId}`);
		},
		[navigate]
	);

	const handleActivityComplete = useCallback(async () => {
		try {
			if (!courseIdentifier) {
				throw new Error('courseIdentifier is undefined.');
			}

			const response = await coursesService.getCourseDetail(courseIdentifier).fetch();

			if (!response.course.currentCourseSession) {
				return;
			}

			navigateToNextAvailableUnit(response.course, response.course.currentCourseSession);
		} catch (error) {
			handleError(error);
		}
	}, [courseIdentifier, handleError, navigateToNextAvailableUnit]);

	const handleSkipActivityButtonClick = useCallback(async () => {
		try {
			if (!course) {
				throw new Error('course is undefined.');
			}

			if (!courseUnit) {
				throw new Error('courseUnit is undefined.');
			}

			const { courseSession } = await coursesService.completeCourseUnit(courseUnit.courseUnitId).fetch();
			navigateToNextAvailableUnit(course, courseSession);
		} catch (error) {
			handleError(error);
		}
	}, [course, courseUnit, handleError, navigateToNextAvailableUnit]);

	const handleCompletedUnitNextButtonClick = useCallback(() => {
		if (!course) {
			throw new Error('course is undefined.');
		}

		if (!course.currentCourseSession) {
			throw new Error('currentCourseSession is undefined.');
		}

		navigateToNextAvailableUnit(course, course.currentCourseSession);
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
								type="button"
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
							type="button"
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
									onCourseUnitClick={(courseUnit) => {
										navigate(`/courses/${course.urlName}/course-units/${courseUnit.courseUnitId}`);
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
											onCourseUnitClick={(courseUnit) => {
												navigate(
													`/courses/${course.urlName}/course-units/${courseUnit.courseUnitId}`
												);
											}}
										/>
									))}
							</>
						)}
					</div>
					<div className={classes.previewPane}>
						<Container>
							<Row>
								<Col md={12} lg={{ offset: 2, span: 8 }}>
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
					</div>
				</div>
			</AsyncWrapper>
		</>
	);
};
