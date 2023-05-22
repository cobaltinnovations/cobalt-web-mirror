import React, { useCallback, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { useIntegratedCareLoaderData } from '../landing';
import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';

const PatientDemographicsV2 = () => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-2">Verify your information</h3>
						<p className="mb-8">
							Your primary care team gave us a head start filling out this information. Please make sure
							all information is correct and complete before continuing.
						</p>
						<hr />
					</Col>
				</Row>
				<Form>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-6">Contact Information</h4>
							<InputHelper className="mb-2" label="Phone Number" type="tel" required />
							<InputHelper className="mb-6" label="Email Address" type="email" required />
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-6">Care Preference</h4>
							<Form.Group className="mb-6">
								<h5 className="mb-2">
									How would you prefer to connect with a mental health care provider?
								</h5>
								<Form.Check
									type="radio"
									name="care-preference"
									id="care-preference--no-preference"
									label="No preference"
									value="NO_PREFERENCE"
								/>
								<Form.Check
									type="radio"
									name="care-preference"
									id="care-preference--telehealth"
									label="Telehealth"
									value="TELEHEALth"
								/>
								<Form.Check
									type="radio"
									name="care-preference"
									id="care-preference--in-person"
									label="In-person"
									value="IN_PERSON"
								/>
							</Form.Group>
							<Form.Group className="mb-6">
								<h5 className="mb-2">
									How far would you be willing to travel from your location (
									{patientOrder?.patientAddress?.postalCode}) to see an in-person provider?
								</h5>
								<Form.Check
									type="radio"
									name="travel-preference"
									id="travel-preference--10-miles"
									label="10 miles"
									value="TEN_MILES"
								/>
								<Form.Check
									type="radio"
									name="travel-preference"
									id="travel-preference--20-miles"
									label="20 miles"
									value="TWENTY_MILES"
								/>
								<Form.Check
									type="radio"
									name="travel-preference"
									id="travel-preference--30-miles"
									label="30 miles"
									value="THIRTY_MILES"
								/>
								<Form.Check
									type="radio"
									name="travel-preference"
									id="travel-preference--45-miles"
									label="45 miles"
									value="FORTY_FIVE_MILES"
								/>
								<Form.Check
									type="radio"
									name="travel-preference"
									id="travel-preference--60-miles"
									label="60 miles"
									value="SIXTY_MILES"
								/>
							</Form.Group>
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-2">About You</h4>
							<p className="mb-6">
								This information is not required but can be helpful for your care team to know.{' '}
							</p>
							<InputHelper className="mb-2" label="Preferred Language" as="select">
								<option value="">Select...</option>
								{referenceDataResponse.languages.map((language) => {
									return (
										<option key={language.languageCode} value={language.languageCode}>
											{language.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper className="mb-2" label="Race" as="select">
								<option value="">Select...</option>
								{referenceDataResponse.races.map((race) => {
									return (
										<option key={race.raceId} value={race.raceId}>
											{race.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper className="mb-2" label="Ethnicity" as="select">
								<option value="">Select...</option>
								{referenceDataResponse.ethnicities.map((ethnicity) => {
									return (
										<option key={ethnicity.ethnicityId} value={ethnicity.ethnicityId}>
											{ethnicity.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper className="mb-2" label="Birth Sex" as="select">
								<option value="">Select...</option>
								{referenceDataResponse.birthSexes.map((birthSex) => {
									return (
										<option key={birthSex.birthSexId} value={birthSex.birthSexId}>
											{birthSex.description}
										</option>
									);
								})}
							</InputHelper>
							<InputHelper className="mb-6" label="Gender Identity" as="select">
								<option value="">Select...</option>
								{referenceDataResponse.genderIdentities.map((genderIdentity) => {
									return (
										<option
											key={genderIdentity.genderIdentityId}
											value={genderIdentity.genderIdentityId}
										>
											{genderIdentity.description}
										</option>
									);
								})}
							</InputHelper>
							<hr />
						</Col>
					</Row>
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Form.Check
								type="checkbox"
								name="verify"
								id="verify--information-correct"
								label="I verify that all information entered is correct and complete to the best of my knowledge."
								value="VERIFIED"
							/>
						</Col>
					</Row>
				</Form>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientDemographicsV2;
