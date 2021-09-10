import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

export const ProviderManagementPaymentTypesAccepted = (): ReactElement => {
	const history = useHistory();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
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
							bsPrefix="cobalt-modal-form__check"
							name="payment-types-accepted"
							id="payment-types-accepted--free-of-charge"
							label="Free of charge"
						/>
						<Form.Check
							type="checkbox"
							bsPrefix="cobalt-modal-form__check"
							name="payment-types-accepted"
							id="payment-types-accepted--out-of-pocket"
							label="Out of poacket"
						/>

						<div className="d-flex align-items-center justify-content-between">
							<Button
								variant="outline-primary"
								onClick={() => {
									history.goBack();
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
