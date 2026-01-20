import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';
import useAccount from '@/hooks/use-account';

export const ProviderManagementPaymentTypesAccepted = (): ReactElement => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Provider Details - Payment Types</title>
			</Helmet>

			<Container className="py-8">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3>payment types accepted</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form onSubmit={handleSubmit}>
							<Form.Check
								type="checkbox"
								name="payment-types-accepted"
								id="payment-types-accepted--free-of-charge"
								label="Free of charge"
							/>
							<Form.Check
								type="checkbox"
								name="payment-types-accepted"
								id="payment-types-accepted--out-of-pocket"
								label="Out of poacket"
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
		</>
	);
};
