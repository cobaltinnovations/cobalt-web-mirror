import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { feedbackService } from '@/lib/services/feedback-service';
import useHandleError from '@/hooks/use-handle-error';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useAnalytics from '@/hooks/use-analytics';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';
import FeedbackSupplement from '@/components/feedback-supplement';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import { analyticsService } from '@/lib/services';
import { AnalyticsNativeEventOverlayViewInCrisisSource, AnalyticsNativeEventTypeId } from '@/lib/models';

const Feedback: FC = () => {
	const handleError = useHandleError();
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();
	const { addFlag } = useFlags();
	const navigate = useNavigate();

	const [feedbackEmailValue, setFeedbackEmailValue] = useState('');
	const [feedbackTextareaValue, setFeedbackTextareaValue] = useState<string>('');

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_CONTACT_US);
	}, []);

	async function handleSubmitFeedbackButtonClick() {
		try {
			await feedbackService.submitFeedback(feedbackEmailValue, feedbackTextareaValue).fetch();
			setFeedbackEmailValue('');
			setFeedbackTextareaValue('');
			addFlag({
				variant: 'success',
				title: 'Your message has been sent',
				description: '',
				actions: [{ title: 'Back to Home', onClick: () => navigate('/') }],
			});
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Feedback</title>
			</Helmet>

			<Container className="pt-4">
				<Row className="mb-4">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<FeedbackSupplement />
						<p className="mb-4">
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
								please contact these resources.
							</span>
						</p>
						<InputHelper
							className="mb-1"
							type="email"
							value={feedbackEmailValue}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setFeedbackEmailValue(event.currentTarget.value);
							}}
							label="Your email address"
						/>
						<small className="d-block ps-2 pe-2 mb-5">
							Enter your email address if you would like our team to follow up in the next two business
							days
						</small>
						<InputHelper
							as="textarea"
							label="Your technical issue or feedback"
							value={feedbackTextareaValue}
							onChange={(event) => {
								setFeedbackTextareaValue(event.currentTarget.value);
							}}
						/>
					</Col>
				</Row>
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Button variant="primary" onClick={handleSubmitFeedbackButtonClick}>
							Submit
						</Button>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Feedback;
