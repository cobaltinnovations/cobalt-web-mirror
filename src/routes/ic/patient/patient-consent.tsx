import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import useHandleError from '@/hooks/use-handle-error';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';
import { integratedCareService } from '@/lib/services';
import { PatientOrderClosureReasonId, PatientOrderModel } from '@/lib/models';
import AsyncWrapper from '@/components/async-page';

const PatientConsent = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [isSaving, setIsSaving] = useState(false);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				setIsSaving(true);

				if (value === 'YES') {
					await integratedCareService.consentToCare(patientOrder.patientOrderId).fetch();

					navigate('/ic/patient/demographics-part-1');
					return;
				}

				if (value === 'NO') {
					await integratedCareService
						.closePatientOrder(patientOrder.patientOrderId, {
							patientOrderClosureReasonId: PatientOrderClosureReasonId.REFUSED_CARE,
						})
						.fetch();

					navigate('/ic/patient');
					return;
				}
			} catch (error) {
				handleError(error);
				setIsSaving(false);
			}
		},
		[handleError, navigate, patientOrder]
	);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-8">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p className="mb-6 fs-large">Hello {patientOrder?.patientFirstName ?? 'patient'},</p>
						<p className="mb-6 fs-large">
							This is a follow up from a conversation with your primary care provider who referred you to
							the Penn Integrated Care program for further assessment. There are a couple of options for
							us to connect.
						</p>
						<p className="mb-2 fs-large">First we need to know...</p>
						<h1 className="mb-8">
							Are you still interested in seeking services for mental health concerns?
						</h1>
						<Form className="mb-8" onSubmit={handleFormSubmit}>
							<Button
								className="mb-2 d-block w-100 text-left border"
								variant="light"
								size="lg"
								name="consent"
								id="consent-yes"
								value="YES"
								type="submit"
								disabled={isSaving}
							>
								Yes
							</Button>
							<Button
								className="d-block w-100 text-left border"
								variant="light"
								size="lg"
								name="consent"
								id="consent-no"
								value="NO"
								type="submit"
								disabled={isSaving}
							>
								No
							</Button>
						</Form>
						<MhicInlineAlert
							variant="primary"
							title="Your responses are not reviewed in real time"
							description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
						/>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientConsent;
