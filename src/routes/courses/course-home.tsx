import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { AnalyticsNativeEventTypeId, CourseModel } from '@/lib/models';
import { analyticsService, coursesService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import useAccount from '@/hooks/use-account';
import CallToActionBlock from '@/components/call-to-action-block';
import { PreviewCanvas } from '@/components/preview-canvas';
import { ScreeningFlow } from '@/components/screening-v2';

export async function loader() {
	return null;
}

export const Component = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [courses, setCourses] = useState<CourseModel[]>([]);
	const [showOnboardingModal, setShowOnboardingModal] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await coursesService.getCourses().fetch();
		setCourses(response.courses);

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
					<Row>
						<Col>
							{courses.map((course) => (
								<CallToActionBlock
									key={course.courseId}
									subheading="Learning Course"
									heading={course.title}
									descriptionHtml={course.description}
									imageUrl={course.imageUrl}
									primaryActionText="Start Course"
									onPrimaryActionClick={() => {
										navigate(`./${course.urlName}`);
									}}
									secondaryActionText="Learn More"
									onSecondaryActionClick={() => {
										window.alert('todo');
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
