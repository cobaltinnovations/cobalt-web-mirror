import { cloneDeep } from 'lodash';
import React, { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';

export const ProviderManagementCommunication = (): ReactElement => {
	const navigate = useNavigate();

	const [primaryEmail, setPrimaryEmail] = useState('');
	const [additionalEmails, setAdditionalEmails] = useState<string[]>(['']);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [timeZone, setTimeZone] = useState('');
	const [callPlatform, setCallPlatform] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<Container className="py-8">
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3>communication</h3>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Form onSubmit={handleSubmit}>
						<InputHelper
							className="mb-1"
							type="email"
							label="Primary email"
							value={primaryEmail}
							onChange={(event) => {
								setPrimaryEmail(event.currentTarget.value);
							}}
							required
						/>

						{additionalEmails.map((additionalEmail, index) => {
							return (
								<div key={index} className="mb-3">
									<InputHelper
										className="mb-1"
										type="email"
										label="Additional Email"
										value={additionalEmail}
										onChange={(event) => {
											const additionalEmailsClone = cloneDeep(additionalEmails);
											additionalEmailsClone[index] = event.currentTarget.value;
											setAdditionalEmails(additionalEmailsClone);
										}}
									/>
									{index !== 0 && (
										<div className="mt-1 text-end">
											<Button
												className="p-0"
												variant="link"
												size="sm"
												onClick={() => {
													const additionalEmailsClone = cloneDeep(additionalEmails);
													additionalEmailsClone.splice(index, 1);
													setAdditionalEmails(additionalEmailsClone);
												}}
											>
												Remove this email
											</Button>
										</div>
									)}
								</div>
							);
						})}
						<Button
							className="mb-3 p-0"
							variant="link"
							size="sm"
							onClick={() => {
								const additionalEmailsClone = cloneDeep(additionalEmails);
								additionalEmailsClone.push('');

								setAdditionalEmails(additionalEmailsClone);
							}}
						>
							Add another email
						</Button>

						<InputHelper
							className="mb-5"
							type="tel"
							label="Patients should call..."
							value={phoneNumber}
							onChange={(event) => {
								setPhoneNumber(event.currentTarget.value);
							}}
							helperText="Optional"
						/>

						<InputHelper
							className="mb-1"
							as="select"
							label="Clock is set to..."
							value={timeZone}
							onChange={(event) => {
								setTimeZone(event.currentTarget.value);
							}}
							required
						>
							<option>Eastern Time (New York)</option>
						</InputHelper>

						<InputHelper
							className="mb-5"
							as="select"
							label="Host calls on..."
							value={callPlatform}
							onChange={(event) => {
								setCallPlatform(event.currentTarget.value);
							}}
							required
						>
							<option>Bluejeans</option>
						</InputHelper>

						<div className="d-flex align-items-center justify-content-between">
							<Button
								variant="outline-primary"
								onClick={() => {
									navigate(-1);
								}}
							>
								back
							</Button>
							<Button variant="primary" type="submit">
								submit
							</Button>
						</div>
					</Form>
				</Col>
			</Row>
		</Container>
	);
};
