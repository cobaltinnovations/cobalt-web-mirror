import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import { PatientInsuranceStatementModal } from '@/components/integrated-care/patient';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';

export const PatientAssessmentResults = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const [showInsuranceStatementModal, setShowInsuranceStatementModal] = useState(false);
	const [subclinicalInterested, setSubclinicalInterested] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<PatientInsuranceStatementModal
				show={showInsuranceStatementModal}
				onHide={() => {
					setShowInsuranceStatementModal(false);
				}}
				onContinue={() => {
					navigate(`/ic/patient/connect-with-support/bhp?patientOrderId=${patientOrder?.patientOrderId}`);
				}}
			/>

			<Container className="py-10">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h1 className="mb-1">Assessment Results</h1>
						<p className="mb-6 fs-large text-gray">
							Completed at {patientOrder?.mostRecentScreeningSessionCompletedAtDescription ?? 'N/A'} by{' '}
							{patientOrder?.mostRecentScreeningSessionCreatedByAccountDisplayName ?? 'N/A'}
						</p>
						<hr className="mb-8" />

						{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.BHP && (
							<>
								<p className="mb-6 fs-large">
									Based on the symptoms reported and your provider's request, we recommend that you
									meet with a <strong>Behavioral Health Provider</strong> in your primary care
									practice.
								</p>
								<p className="mb-6 fs-large">
									The Behavioral Health Provider will discuss treatment options that will work in
									collaboration with your primary care provider.
								</p>
								<p className="mb-6 fs-large">
									You can schedule an appointment with a Behavioral Health Provider by browsing the
									list of providers and choosing an available appointment time.
								</p>
								<div className="mb-4 text-center">
									<Button
										size="lg"
										onClick={() => {
											setShowInsuranceStatementModal(true);
										}}
									>
										Find Appointment
									</Button>
								</div>
								<div className="text-center">
									<Button
										variant="outline-primary"
										size="lg"
										onClick={() => {
											navigate('/ic/patient');
										}}
									>
										Return to Home
									</Button>
								</div>
							</>
						)}

						{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE && (
							<>
								<p className="mb-6 fs-large">
									Based on the symptoms reported and your provider's request, we would like to set you
									up with a [Provider Type] in your area.
								</p>
								<p className="mb-6 fs-large">
									A Mental Health Intake Coordinater will review your results and send you a list of
									resources that work with your insurance within the next [24 hours]. Please check
									your
									{institution?.myChartName ?? 'MyChart'} messages for more details.
								</p>
								<p className="mb-6 fs-large">
									You can also call us at{' '}
									<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
										{institution?.integratedCarePhoneNumberDescription}
									</a>{' '}
									if you do not receive the {institution?.myChartName ?? 'MyChart'} message or if you
									wish to speak to a Mental Health Intake Coordinator about your options.
								</p>
								<div className="text-center">
									<Button
										size="lg"
										onClick={() => {
											navigate('/ic/patient');
										}}
									>
										Return to Home
									</Button>
								</div>
							</>
						)}

						{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
							<>
								{subclinicalInterested ? (
									<>
										<p className="mb-6 fs-large">
											You reported a low severity of symptoms and indicated that you are
											interested in receiving mental health care.
										</p>
										<p className="mb-6 fs-large">
											A Mental Health Intake Coordinator will review your results and send you a
											list of resources that work with your insurance within the next 24 hours.
											Please check {institution?.myChartName ?? 'MyChart'} for more details.
										</p>
										<p className="mb-6 fs-large">
											You can also call us at{' '}
											<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
												{institution?.integratedCarePhoneNumberDescription}
											</a>{' '}
											if you do not receive the {institution?.myChartName ?? 'MyChart'} message or
											if you wish to speak to a Mental Health Intake Coordinator about your
											options.
										</p>
									</>
								) : (
									<>
										<p className="mb-6 fs-large">
											You reported a low severity of symptoms and indicated that you are not
											interested in receiving mental health care at this time.
										</p>
										<p className="mb-6 fs-large">
											We will let your primary care provider know your response, but feel free to
											call us at{' '}
											<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
												{institution?.integratedCarePhoneNumberDescription}
											</a>{' '}
											if you change your mind.
										</p>
									</>
								)}
								<div className="text-center">
									<Button
										size="lg"
										onClick={() => {
											navigate('/ic/patient');
										}}
									>
										Return to Home
									</Button>
								</div>
							</>
						)}

						{patientOrder?.patientOrderSafetyPlanningStatusId ===
							PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
							<>
								<p className="mb-6 fs-large">Safety Planning Message</p>
								<div className="text-center">
									<Button
										size="lg"
										onClick={() => {
											navigate('/ic/patient');
										}}
									>
										Return to Home
									</Button>
								</div>
							</>
						)}

						<MhicInlineAlert
							className="mt-12"
							variant="primary"
							title="NOTE: Your responses are not reviewed in real time"
							description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
						/>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientAssessmentResults;
