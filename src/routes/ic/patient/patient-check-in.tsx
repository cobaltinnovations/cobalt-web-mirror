import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { PatientOrderModel, PatientOrderResourceCheckInResponseStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import InlineAlert from '@/components/inline-alert';
import useAccount from '@/hooks/use-account';

const PatientCheckIn = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();
	const { institution } = useAccount();

	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [isSaving, setIsSaving] = useState(false);

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

				await integratedCareService
					.updatePatientOrderResourceCheckInResponseStatusId(patientOrder.patientOrderId, {
						patientOrderResourceCheckInResponseStatusId:
							value as PatientOrderResourceCheckInResponseStatusId,
					})
					.fetch();

				navigate('/ic/patient');
			} catch (error) {
				handleError(error);
				setIsSaving(false);
			}
		},
		[handleError, navigate, patientOrder]
	);

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Integrated Care - Check In</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-20">
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-6 fs-large">Hello {patientOrder?.patientFirstName ?? 'patient'},</p>
							<p className="mb-2 fs-large">
								We recently helped you find a mental health care provider in the community. We are
								checking in to see if you were able to schedule or attend an appointment.
							</p>
							<h2 className="mb-2">
								Were you able to schedule an appointment with a mental health provider?
							</h2>
							<p className="mb-8 fs-large">(Choose the best answer)</p>

							<Form className="mb-8" onSubmit={handleFormSubmit}>
								<Button
									className="mb-2 d-block w-100 text-left border"
									variant="light"
									size="lg"
									name="check-in"
									id="check-in--scheduled"
									value={PatientOrderResourceCheckInResponseStatusId.APPOINTMENT_SCHEDULED}
									type="submit"
									disabled={isSaving}
								>
									Yes. I have already scheduled or attended an appointment.
								</Button>
								<Button
									className="mb-2 d-block w-100 text-left border"
									variant="light"
									size="lg"
									name="check-in"
									id="check-in--none"
									value={PatientOrderResourceCheckInResponseStatusId.NEED_FOLLOWUP}
									type="submit"
									disabled={isSaving}
								>
									No. The referral didn't work out, and I would like to talk to someone for additional
									options.
								</Button>
								<Button
									className="mb-2 d-block w-100 text-left border"
									variant="light"
									size="lg"
									name="check-in"
									id="check-in--no-longer-need-care"
									value={PatientOrderResourceCheckInResponseStatusId.NO_LONGER_NEED_CARE}
									type="submit"
									disabled={isSaving}
								>
									I am no longer in need of mental health care.
								</Button>
							</Form>

							<InlineAlert
								title="Your responses are not reviewed in real time"
								description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
							/>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default PatientCheckIn;
