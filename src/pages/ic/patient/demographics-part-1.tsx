import React, { useCallback, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';
import { ReferenceDataResponse } from '@/lib/models';
import { accountService } from '@/lib/services';
import AsyncPage from '@/components/async-page';

const DemographicsPart1 = () => {
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();

	const fetchData = useCallback(async () => {
		const response = await accountService.getReferenceData().fetch();
		setReferenceData(response);
	}, []);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-20">
				<Row className="mb-8">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h2 className="mb-2">Let's begin with who you are</h2>
						<p className="mb-0">
							Your primary care team gave us a head start filling out this information. Please make sure
							your preferred cell phone number and email address are correct, or enter these if they have
							not been provided.
						</p>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form>
							<InputHelper className="mb-2" type="text" name="first-name" label="First Name" />
							<InputHelper className="mb-2" type="text" name="last-name" label="Last Name" />
							<DatePicker
								className="mb-2"
								labelText="Coverage Ends"
								selected={undefined}
								onChange={(date) => {
									console.log(date);
								}}
							/>
							<InputHelper className="mb-2" type="tel" name="phone-number" label="Phone Number" />
							<InputHelper className="mb-2" type="email" name="email-address" label="Email Address" />
							<InputHelper
								as="select"
								className="mb-2"
								name="insurance-provider"
								label="Insurance Provider"
							>
								{referenceData?.insurances.map((option) => (
									<option key={option.insuranceId} value={option.insuranceId}>
										{option.description}
									</option>
								))}
							</InputHelper>
						</Form>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default DemographicsPart1;
