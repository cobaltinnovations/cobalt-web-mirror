import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { CourseModel } from '@/lib/models';
import { coursesService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
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
	const { courseIdentifier } = useParams<{ courseIdentifier: string }>();
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [course, setCourse] = useState<CourseModel>();

	const fetchData = useCallback(async () => {
		if (!courseIdentifier) {
			throw new Error('courseIdentifier is undefined.');
		}

		const response = await coursesService.getCourseDetail(courseIdentifier).fetch();
		setCourse(response.course);
	}, [courseIdentifier]);

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
									{institution.onboardingScreeningFlowId && (
										<ScreeningFlow
											screeningFlowId={institution.onboardingScreeningFlowId}
											onScreeningFlowComplete={() => {
												window.alert('screening flow complete, onto the next unit!');
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
