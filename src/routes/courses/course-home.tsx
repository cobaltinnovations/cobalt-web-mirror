import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { AnalyticsNativeEventTypeId, CourseModel } from '@/lib/models';
import { analyticsService, coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import useAccount from '@/hooks/use-account';
import CallToActionBlock from '@/components/call-to-action-block';
import { PreviewCanvas } from '@/components/preview-canvas';
import { ScreeningFlow } from '@/components/screening-v2';
import { CourseContinue } from '@/components/courses';

export async function loader() {
	return null;
}

export const Component = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [currentCourses, setCurrentCourses] = useState<CourseModel[]>([]);
	const [comingSoonCourses, setComingSoonCourses] = useState<CourseModel[]>([]);
	const [inProgressCourses, setInProgressCourses] = useState<CourseModel[]>([]);
	const [completedCourses, setCompletedCourses] = useState<CourseModel[]>([]);
	const [showOnboardingModal, setShowOnboardingModal] = useState(false);

	const fetchData = useCallback(async () => {
		const { current, comingSoon, inProgress, completed } = await coursesService.getCourses().fetch();
		setCurrentCourses(current);
		setComingSoonCourses(comingSoon);
		setInProgressCourses(inProgress);
		setCompletedCourses(completed);

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_COURSES);
	}, []);

	return (
		<>
			<PreviewCanvas title={institution.name} show={showOnboardingModal}>
				{institution.onboardingScreeningFlowId && (
					<Container>
						<Row>
							<Col md={12} lg={{ span: 6, offset: 3 }}>
								<ScreeningFlow
									screeningFlowParams={{ screeningFlowId: institution.onboardingScreeningFlowId }}
									onScreeningFlowComplete={() => {
										setShowOnboardingModal(false);
									}}
								/>
							</Col>
						</Row>
					</Container>
				)}
			</PreviewCanvas>

			<Helmet>
				<title>Cobalt | Courses - Home</title>
			</Helmet>
			<Container className="py-24">
				<Row className="mb-24">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h5 className="mb-5 text-center text-gray">Welcome to {institution.name}</h5>
						<h1 className="mb-0 text-center">Check out our parent education courses</h1>
						<Button
							onClick={() => {
								setShowOnboardingModal(true);
							}}
						>
							Onboarding
						</Button>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchData}>
					<Row className="py-16">
						<Col>
							<div className="mb-8 d-flex align-items-center justify-content-between">
								<h3 className="mb-0">Continue Learning</h3>
								<Link to="/group-sessions">View learning history</Link>
							</div>
							{currentCourses.map((course) => (
								<CourseContinue key={course.courseId} course={course} />
							))}
						</Col>
					</Row>
					<Row className="py-16">
						<Col>
							<div className="mb-8">
								<h3 className="mb-0">Other Courses</h3>
							</div>
							{inProgressCourses.map((course) => (
								<CallToActionBlock
									key={course.courseId}
									heading={course.title}
									descriptionHtml={course.description}
									imageUrl={course.imageUrl}
									primaryActionText="Start Course"
									onPrimaryActionClick={() => {
										navigate(`/courses/${course.urlName}`);
									}}
								/>
							))}
						</Col>
					</Row>
					<Row className="py-16">
						<Col>
							<div className="mb-8">
								<h3 className="mb-0">Coming Soon</h3>
							</div>
							{comingSoonCourses.map((course) => (
								<CallToActionBlock
									key={course.courseId}
									variant="light"
									subheading="Coming soon"
									heading={course.title}
									descriptionHtml={course.description}
									imageUrl={course.imageUrl}
								/>
							))}
						</Col>
					</Row>
					<Row className="py-16">
						<Col>
							<div className="mb-8">
								<h3 className="mb-0">Completed</h3>
							</div>
							{completedCourses.map((course) => (
								<CallToActionBlock
									key={course.courseId}
									variant="light"
									subheading="Completed"
									heading={course.title}
									descriptionHtml={course.description}
									imageUrl={course.imageUrl}
									primaryActionText="View Course"
									onPrimaryActionClick={() => {
										navigate(`/courses/${course.urlName}`);
									}}
								/>
							))}
						</Col>
					</Row>
				</AsyncWrapper>
			</Container>
		</>
	);
};
