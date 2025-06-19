import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Row, Tab } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	CourseModel,
	CourseModuleModel,
	CourseSessionStatusId,
	CourseUnitModel,
} from '@/lib/models';
import { analyticsService, coursesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import PageHeader from '@/components/page-header';
import TabBar from '@/components/tab-bar';
import { CourseModule } from '@/components/courses';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import {
	getCompletedCourseUnitIds,
	getCurrentCourseModule,
	getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession,
	getOptionalCourseModules,
	getOrderedCourseUnits,
	getRequiredCourseModules,
} from '@/lib/utils';
import { ReactComponent as BeforeIcon } from '@/assets/icons/icon-before.svg';
import ConfirmDialog from '@/components/confirm-dialog';
import ResourceLibraryCard from '@/components/resource-library-card';

export async function loader() {
	return null;
}

enum MODE {
	OVERVIEW = 'OVERVIEW',
	ADDITIONAL_RESOURCES = 'ADDITIONAL_RESOURCES',
}

export const Component = () => {
	const { courseIdentifier } = useParams<{ courseIdentifier: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const mode = useMemo(() => searchParams.get('mode') ?? MODE.OVERVIEW, [searchParams]);

	const navigate = useNavigate();
	const handleError = useHandleError();
	const [course, setCourse] = useState<CourseModel>();
	const [requiredModules, setRequiredModules] = useState<CourseModuleModel[]>([]);
	const [optionalModules, setOptionalModules] = useState<CourseModuleModel[]>([]);
	const [showRestartCourseModal, setShowRestartCourseModal] = useState(false);
	const [showResumeButton, setShowResumeButton] = useState(false);

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const { course: currentCourse } = await coursesService.getCourseDetail(courseIdentifier).fetch();
		const { courseModules, currentCourseSession } = currentCourse;
		const optionalCourseModuleIds = currentCourseSession?.optionalCourseModuleIds ?? [];

		setCourse(currentCourse);
		setRequiredModules(getRequiredCourseModules(courseModules, optionalCourseModuleIds));
		setOptionalModules(getOptionalCourseModules(courseModules, optionalCourseModuleIds));

		if (!currentCourseSession) {
			return;
		}

		setShowResumeButton(currentCourseSession.courseSessionStatusId !== CourseSessionStatusId.COMPLETED);
	}, [courseIdentifier]);

	useEffect(() => {
		if (!course) {
			return;
		}

		const { courseId, currentCourseSession } = course;

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_COURSE_DETAIL, {
			courseId,
			...(currentCourseSession && { courseSessionId: currentCourseSession.courseSessionId }),
			mode,
		});
	}, [course, mode]);

	const handleStartCourseButtonClick = useCallback(async () => {
		try {
			if (!course) {
				throw new Error('course is undefined.');
			}

			const { courseId, courseModules } = course;
			const { courseSession } = await coursesService.createCourseSession({ courseId }).fetch();
			const courseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(courseModules, courseSession);

			if (!courseUnitId) {
				throw new Error('unitId undefined.');
			}

			navigate(`/courses/${course.urlName}/course-units/${courseUnitId}`);
		} catch (error) {
			handleError(error);
		}
	}, [course, handleError, navigate]);

	const handleResumeCourseButtonClick = useCallback(() => {
		if (!course || !course.currentCourseSession) {
			return;
		}

		const { courseModules, currentCourseSession, urlName } = course;
		const courseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(
			courseModules,
			currentCourseSession
		);

		if (!courseUnitId) {
			return;
		}

		navigate(`/courses/${urlName}/course-units/${courseUnitId}`);
	}, [course, navigate]);

	const handleCourseUnitClick = useCallback(
		async (courseUnit: CourseUnitModel) => {
			if (!course) {
				return;
			}

			if (course.currentCourseSession) {
				navigate(`/courses/${course.urlName}/course-units/${courseUnit.courseUnitId}`);
			} else {
				handleStartCourseButtonClick();
			}

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_UNIT, {
				courseId: course.courseId,
				...(course.currentCourseSession && {
					courseSessionId: course.currentCourseSession.courseSessionId,
				}),
				courseUnitId: courseUnit.courseUnitId,
				source: 'COURSE_DETAIL',
			});
		},
		[course, handleStartCourseButtonClick, navigate]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Detail</title>
			</Helmet>

			<ConfirmDialog
				show={showRestartCourseModal}
				titleText="Restart Course"
				bodyText="Are you sure you want to restart the course?"
				detailText="All of your progress will be reset. Any units you completed will be marked as incomplete."
				dismissText="Cancel"
				confirmText="Restart"
				onConfirm={handleStartCourseButtonClick}
				onHide={() => {
					setShowRestartCourseModal(false);
				}}
			/>

			<AsyncWrapper fetchData={fetchData}>
				<PageHeader
					className="bg-p50"
					title={<h1>{course?.title}</h1>}
					descriptionHtml={course?.description}
					imageUrl={course?.imageUrl}
					imageAlt=""
				/>
				<Container>
					<Row className="mb-24">
						<Col>
							<Tab.Container id="course-tabs" defaultActiveKey={MODE.OVERVIEW} activeKey={mode}>
								<TabBar
									value={mode}
									tabs={[
										{
											title: 'Course Overview',
											value: MODE.OVERVIEW,
										},
										{
											title: 'Additional Resources',
											value: MODE.ADDITIONAL_RESOURCES,
										},
									]}
									onTabClick={(tabValue) => {
										searchParams.set('mode', tabValue);
										setSearchParams(searchParams);
									}}
								/>
								<Tab.Content>
									<Tab.Pane eventKey={MODE.OVERVIEW} mountOnEnter unmountOnExit>
										<Row>
											<Col md={12} lg={7}>
												<div className="pt-8 mb-11  d-xl-flex align-items-center justify-content-between">
													<h2 className="mb-4 mb-xl-0">Course Content</h2>
													{course?.currentCourseSession ? (
														<div className="d-flex align-items-center">
															{showResumeButton && (
																<Button
																	type="button"
																	onClick={handleResumeCourseButtonClick}
																>
																	Resume Course
																</Button>
															)}
															<Button
																type="button"
																variant="link"
																className="d-flex align-items-center text-decoration-none"
																onClick={() => {
																	setShowRestartCourseModal(true);
																}}
															>
																<BeforeIcon className="me-1" />
																Restart Course
															</Button>
														</div>
													) : (
														<Button type="button" onClick={handleStartCourseButtonClick}>
															Start Course
														</Button>
													)}
												</div>
												{course &&
													requiredModules.map((courseModule, courseModuleIndex) => {
														const isLast = requiredModules.length - 1 === courseModuleIndex;

														return (
															<CourseModule
																className={classNames({
																	'mb-4': !isLast,
																})}
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
																		? course.currentCourseSession
																				.courseUnitLockStatusesByCourseUnitId
																		: course.defaultCourseUnitLockStatusesByCourseUnitId
																}
																onCourseUnitClick={handleCourseUnitClick}
																initialShow={
																	getCurrentCourseModule(
																		requiredModules,
																		course.currentCourseSession
																	)?.courseModuleId === courseModule.courseModuleId
																}
															/>
														);
													})}
												{optionalModules.length > 0 && (
													<>
														<h2 className="pt-14 mb-2">Optional Modules</h2>
														<p className="mb-6">
															These modules do not count towards course completion, but
															may have useful information.
														</p>
														{course &&
															optionalModules.map((courseModule, courseModuleIndex) => {
																const isLast =
																	optionalModules.length - 1 === courseModuleIndex;

																return (
																	<CourseModule
																		className={classNames({
																			'mb-4': !isLast,
																		})}
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
																				? course.currentCourseSession
																						.courseUnitLockStatusesByCourseUnitId
																				: course.defaultCourseUnitLockStatusesByCourseUnitId
																		}
																		onCourseUnitClick={handleCourseUnitClick}
																		initialShow={
																			getCurrentCourseModule(
																				requiredModules,
																				course.currentCourseSession
																			)?.courseModuleId ===
																			courseModule.courseModuleId
																		}
																	/>
																);
															})}
													</>
												)}
											</Col>
											<Col md={12} lg={5}>
												<h3 className="pt-6 mb-4">Course Focus</h3>
												<WysiwygDisplay className="mb-10" html={course?.focus ?? ''} />
												<hr />
												<h3 className="pt-6 mb-4">Need Help?</h3>
												<Link to="/feedback">Reach out to us here</Link>
											</Col>
										</Row>
									</Tab.Pane>
									<Tab.Pane eventKey={MODE.ADDITIONAL_RESOURCES} mountOnEnter unmountOnExit>
										<Row className="pt-10 mb-10">
											<Col>
												<h3 className="mb-1">Additional Resources</h3>
												<p className="mb-0">
													The following resources are not used throughout the course but may
													be helpful once you've finished with the course activities.
												</p>
											</Col>
										</Row>
										<Row>
											{(course?.contents ?? []).map((content) => (
												<Col
													xs={12}
													sm={12}
													md={6}
													lg={4}
													key={content.contentId}
													className="mb-8"
												>
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
															if (!course) {
																return;
															}

															analyticsService.persistEvent(
																AnalyticsNativeEventTypeId.CLICKTHROUGH_COURSE_CONTENT,
																{
																	courseId: course.courseId,
																	...(course.currentCourseSession && {
																		courseSessionId:
																			course.currentCourseSession.courseSessionId,
																	}),
																	contentId: content.contentId,
																}
															);
														}}
														trackTagEvent={(_tag) => {
															return;
														}}
													/>
												</Col>
											))}
										</Row>
									</Tab.Pane>
								</Tab.Content>
							</Tab.Container>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};
