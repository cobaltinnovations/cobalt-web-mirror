import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useHandleError from '@/hooks/use-handle-error';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';
import { integratedCareService } from '@/lib/services';
import { PatientOrderConsentStatusId, PatientOrderModel } from '@/lib/models';
import AsyncWrapper from '@/components/async-page';

const PatientConsent = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [isSaving, setIsSaving] = useState(false);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [showCloseOrderModal, setShowCloseOrderModal] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			if (value === PatientOrderConsentStatusId.REJECTED) {
				setShowCloseOrderModal(true);
				return;
			}

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				setIsSaving(true);

				await integratedCareService
					.updatePatientOrderConsentStatus(patientOrder.patientOrderId, {
						patientOrderConsentStatusId: value as PatientOrderConsentStatusId,
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

	const handleCloseOrderModalConfirmButtonClick = useCallback(async () => {
		try {
			if (!patientOrder) {
				throw new Error('patientOrder is undefined.');
			}

			setIsSaving(true);

			await integratedCareService
				.updatePatientOrderConsentStatus(patientOrder.patientOrderId, {
					patientOrderConsentStatusId: PatientOrderConsentStatusId.REJECTED,
				})
				.fetch();

			navigate('/ic/patient');
		} catch (error) {
			handleError(error);
			setIsSaving(false);
		}
	}, [handleError, navigate, patientOrder]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Consent</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Modal
					centered
					show={showCloseOrderModal}
					onHide={() => {
						setShowCloseOrderModal(false);
					}}
				>
					<Modal.Header closeButton>
						<Modal.Title>Close Order</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="mb-0 fw-bold">
							Please confirm that you are no longer interested in seeking services for mental health
							concerns
						</p>
					</Modal.Body>
					<Modal.Footer className="text-right">
						<Button
							variant="outline-primary"
							className="me-2"
							onClick={() => {
								setShowCloseOrderModal(false);
							}}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button variant="primary" onClick={handleCloseOrderModalConfirmButtonClick} disabled={isSaving}>
							Confirm
						</Button>
					</Modal.Footer>
				</Modal>

				<Container className="py-20">
					<Row className="mb-8">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-6 fs-large">Hello {patientOrder?.patientFirstName ?? 'patient'},</p>
							<p className="mb-6 fs-large">
								This is a follow up from a conversation with your primary care provider who referred you
								to the Penn Integrated Care program for further assessment. There are a couple of
								options for us to connect.
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
									value={PatientOrderConsentStatusId.CONSENTED}
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
									value={PatientOrderConsentStatusId.REJECTED}
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
		</>
	);
};

export default PatientConsent;
