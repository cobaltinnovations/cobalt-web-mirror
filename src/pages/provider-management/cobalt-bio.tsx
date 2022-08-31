import React, { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';

export const ProviderManagementCobaltBio = (): ReactElement => {
	const navigate = useNavigate();
	const [bio, setBio] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<Container className="py-8">
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3>cobalt bio</h3>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Form onSubmit={handleSubmit}>
						<InputHelper
							className="mb-5"
							as="textarea"
							label="Your Cobalt bio"
							value={bio}
							onChange={(event) => {
								setBio(event.currentTarget.value);
							}}
						/>

						<div className="d-flex align-items-center justify-content-between">
							<Button
								variant="outline-primary"
								onClick={() => {
									navigate(-1);
								}}
							>
								Back
							</Button>
							<Button variant="primary" type="submit">
								Submit
							</Button>
						</div>
					</Form>
				</Col>
			</Row>
		</Container>
	);
};
