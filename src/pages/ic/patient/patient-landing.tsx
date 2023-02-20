import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as ScreeningToDo } from '@/assets/screening-images/screening-to-do.svg';
import { ReactComponent as Welcome } from '@/assets/screening-images/welcome.svg';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const IntegratedCarePatientLandingPage = () => {
	const { account } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();

	const [currentStep, setCurrentStep] = useState(0);
	const [acknowledged, setAcknowledged] = useState(false);

	return (
		<Container className="py-8">
			<Row className="mb-6">
				{currentStep === 0 && (
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h2 className="mb-6">Welcome to Cobalt Integrated Care, {account?.displayName}</h2>

						<Welcome className="mb-6" style={{ width: '100%', height: 'auto' }} />

						<p className="mb-6">
							Your primary care provider suggested that you are interested in receiving support for your
							mental health through the Cobalt Integrated Care program. Please take our assessment so we
							can determine what type of care is best for you. This tool is not for emergencies - if you
							need immediate help at any time during the assessment, please click the "In Crisis" button
							in the top right corner. Everything you share is confidential - COBALT is a simple, secure
							way to manage your Cobalt Medicine mental health care from your computer or mobile device.
						</p>

						<div className="d-flex">
							<Button
								variant="primary"
								className="flex-grow-1"
								onClick={() => {
									setCurrentStep(1);
								}}
							>
								<EditIcon /> Take the assessment
							</Button>
						</div>
					</Col>
				)}

				{currentStep === 1 && (
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<ScreeningToDo className="mb-6" style={{ width: '100%', height: 'auto' }} />

						<h2 className="mb-6">Take the assessment</h2>

						<p className="mb-6">
							To match you with the right support, we'dlike to learn about you and how you're feeling.
							Before we start. please make sure you are in a comfortable place. This assessment takes
							about 10-15 minutes to complete. Only you and your care team will have access to your
							answers. You can take a break at any time - we'll save your progress.
						</p>

						<div className="d-flex">
							<Button
								variant="primary"
								className="flex-grow-1"
								onClick={() => {
									setCurrentStep(2);
								}}
							>
								Let's Continue
							</Button>
						</div>
					</Col>
				)}

				{currentStep === 2 && (
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p className="mb-6">
							If you need immediate help, call 911 or click{' '}
							<span
								className="text-primary text-decoration-underline cursor-pointer"
								tabIndex={0}
								onClick={() => {
									trackEvent(CrisisAnalyticsEvent.clickCrisisICAssessment());
									openInCrisisModal();
								}}
							>
								HERE
							</span>{' '}
							for a list of resources. The resources above can be accessed at any time by clicking the In
							Crisis button on the top right.
						</p>

						<Form.Check
							className="mb-6"
							type="checkbox"
							id="acknowledgement"
							name="visit-type"
							label="I acknowledge that this assessment is not a way to communicate urgent information to my care team."
							checked={acknowledged}
							onChange={(event) => {
								setAcknowledged(event.currentTarget.checked);
							}}
						/>

						<div className="d-flex">
							<Button
								variant="primary"
								className="flex-grow-1"
								disabled={!acknowledged}
								onClick={() => {
									navigate('/ic/patient/info');
								}}
							>
								Continue
							</Button>
						</div>
					</Col>
				)}
			</Row>
		</Container>
	);
};

export default IntegratedCarePatientLandingPage;
