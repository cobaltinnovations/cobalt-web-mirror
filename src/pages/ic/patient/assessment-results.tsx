import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import useAccount from '@/hooks/use-account';

export const PatientAssessmentResults = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [subclinicalInterested, setSubclinicalInterested] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getOpenOrderForCurrentPatient().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-6">
					<Col
						md={{ span: 10, offset: 1 }}
						lg={{ span: 8, offset: 2 }}
						xl={{ span: 6, offset: 3 }}
						className="text-center"
					>
						<h1 className="mb-6">Assessment Results</h1>

						{patientOrder?.patientOrderStatusId === PatientOrderStatusId.BHP && (
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
								<div className="mb-5">
									<Button
										size="lg"
										onClick={() => {
											navigate(
												`/ic/patient/connect-with-support/bhp?patientOrderId=${patientOrder?.patientOrderId}`
											);
										}}
									>
										Find Appointment
									</Button>
								</div>
								<div>
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

						{patientOrder?.patientOrderStatusId === PatientOrderStatusId.SPECIALTY_CARE && (
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
								<div>
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

						{patientOrder?.patientOrderStatusId === PatientOrderStatusId.SUBCLINICAL && (
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
								<div>
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

						{patientOrder?.patientOrderStatusId === PatientOrderStatusId.SAFETY_PLANNING && (
							<>
								<p className="mb-6 fs-large">Safety Planning Message</p>
								<p className="mb-6 fs-large">Safety Planning Actions</p>
								<div>
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
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientAssessmentResults;
