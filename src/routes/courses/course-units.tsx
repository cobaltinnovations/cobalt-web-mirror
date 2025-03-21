import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { CourseModel, CourseUnitModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { ScreeningFlow } from '@/components/screening-v2';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { CourseModule } from '@/components/courses';
import { createUseThemedStyles } from '@/jss/theme';

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
	const { courseIdentifier, unitId } = useParams<{ courseIdentifier: string; unitId: string }>();
	const navigate = useNavigate();
	const [course, setCourse] = useState<CourseModel>();
	const [courseUnit, setCourseUnit] = useState<CourseUnitModel>();

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const response = await coursesService.getCourseDetail(courseIdentifier).fetch();
		const courseUnitsFlat = response.course.courseModules.map((courseModule) => courseModule.courseUnits).flat();
		const desiredCourseUnit = courseUnitsFlat.find((cu) => cu.courseUnitId === unitId);

		setCourse(response.course);
		setCourseUnit(desiredCourseUnit);
	}, [courseIdentifier, unitId]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Courses - Session</title>
			</Helmet>
			<AsyncWrapper fetchData={fetchData}>
				<div className={classes.wrapper}>
					<div className={classes.header}>
						<Button
							className="me-2"
							onClick={() => {
								navigate(-1);
							}}
						>
							Go Back
						</Button>
						{course?.title}
					</div>
					<div className={classes.aside}>
						{course &&
							(course.courseModules ?? []).map((courseModule, courseModuleIndex) => {
								const isLast = (course?.courseModules ?? []).length - 1 === courseModuleIndex;

								return (
									<CourseModule
										className={classNames({
											'mb-4': !isLast,
										})}
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
									/>
								);
							})}
					</div>
					<div className={classes.previewPane}>
						<Container>
							<Row>
								<Col md={12} lg={{ offset: 1, span: 10 }}>
									{courseUnit?.screeningFlowId && (
										<ScreeningFlow
											screeningFlowId={courseUnit.screeningFlowId}
											onScreeningFlowComplete={() => {
												window.alert('[TODO]: screening flow complete, load next unit');
											}}
										/>
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
