import React, { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { AnalyticsNativeEventOverlayViewInCrisisSource, AnalyticsNativeEventTypeId } from '@/lib/models';
import { feedbackService } from '@/lib/services/feedback-service';
import { analyticsService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useAnalytics from '@/hooks/use-analytics';
import useFlags from '@/hooks/use-flags';
import useAccount from '@/hooks/use-account';
import InputHelper from '@/components/input-helper';
import FeedbackSupplement from '@/components/feedback-supplement';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import HeroContainer from '@/components/hero-container';

const Feedback: FC = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { institution } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({ emailAddress: '', feedbackTypeId: '', feedback: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_CONTACT_US);
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setIsSubmitting(true);

			try {
				await feedbackService.submitFeedback(formValues).fetch();

				setFormValues({ emailAddress: '', feedbackTypeId: '', feedback: '' });
				addFlag({
					variant: 'success',
					title: 'Your message has been sent',
					description: '',
					actions: [{ title: 'Back to Home', onClick: () => navigate('/') }],
				});
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[addFlag, formValues, handleError, navigate]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Feedback</title>
			</Helmet>

			<HeroContainer>
				<h1 className="mb-0 text-center">Contact Us</h1>
			</HeroContainer>

			<Container className="py-10">
				<Row className="mb-4">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<FeedbackSupplement />
						<h4 className="mb-4">This form is not for clinical concerns.</h4>
						<p className="mb-0">
							For mental health support{' '}
							<a href={`tel:${institution.clinicalSupportPhoneNumber}`} className="fw-normal">
								call {institution.clinicalSupportPhoneNumberDescription ?? 'N/A'}
							</a>
						</p>
						<p className="mb-8">
							If you are in immediate crisis,{' '}
							<span
								className="text-primary text-decoration-underline cursor-pointer"
								tabIndex={0}
								onClick={() => {
									trackEvent(CrisisAnalyticsEvent.clickCrisisFeedback());

									analyticsService.persistEvent(AnalyticsNativeEventTypeId.OVERLAY_VIEW_IN_CRISIS, {
										source: AnalyticsNativeEventOverlayViewInCrisisSource.CONTACT_US,
									});

									openInCrisisModal();
								}}
							>
								contact these resources.
							</span>
						</p>
						<hr className="mb-6" />
						<Form onSubmit={handleFormSubmit}>
							<fieldset disabled={isSubmitting}>
								<Form.Label className="mb-6">Contact us</Form.Label>
								<InputHelper
									className="mb-6"
									type="email"
									value={formValues.emailAddress}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											emailAddress: currentTarget.value,
										}));
									}}
									label="Your email address"
									helperText="Enter your email address if you would like our team to follow up (Avg response time is two
							business days)."
								/>
								<InputHelper
									className="mb-6"
									as="select"
									label="Reason for contacting"
									value={formValues.feedbackTypeId}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											feedbackTypeId: currentTarget.value,
										}));
									}}
									required
								>
									<option value="" disabled>
										Select reason...
									</option>
									<option value="HELP">Help using the platform</option>
									<option value="FEEDBACK">Feedback or suggestion</option>
									<option value="OTher">Other</option>
								</InputHelper>
								<InputHelper
									className="mb-6"
									as="textarea"
									label="Describe your technical issue or feedback"
									value={formValues.feedback}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											feedback: currentTarget.value,
										}));
									}}
									required
								/>
								<div className="text-right">
									<Button type="submit" variant="primary">
										Submit
									</Button>
								</div>
							</fieldset>
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Feedback;
