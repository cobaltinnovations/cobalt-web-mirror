import React, { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';

import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import useAccount from '@/hooks/use-account';

interface StrengthModel {
	id: string;
	title: string;
}

export const ProviderManagementPersonalDetails = (): ReactElement => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	const [strengthOptions] = useState<StrengthModel[]>([
		{
			id: 'CREATIVE',
			title: 'creative',
		},
		{
			id: 'EMPATHETIC',
			title: 'empathetic',
		},
	]);
	const [strengthSelections, setStrengthSelections] = useState<StrengthModel[]>([]);
	const [workWithDescription, setWorkWithDescription] = useState('');
	const [methods, setMethods] = useState('');
	const [motivations, setMotivations] = useState('');
	const [pronouns, setPronouns] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Provider Details - Personal Details</title>
			</Helmet>

			<Container className="py-8">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3>personal details</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form onSubmit={handleSubmit}>
							<TypeaheadHelper
								className="mb-3"
								id="strengths-typeahead"
								label="Describe your strengths. I am: "
								required
								multiple
								labelKey="title"
								options={strengthOptions}
								selected={strengthSelections}
								onChange={(options) => {
									setStrengthSelections(options as StrengthModel[]);
								}}
								helperText="Choose or enter your own"
								characterCounter={3}
								allowNew
							/>

							<InputHelper
								className="mb-3"
								as="textarea"
								label="Who do you want to work with?"
								value={workWithDescription}
								onChange={(event) => {
									setWorkWithDescription(event.currentTarget.value);
								}}
								characterCounter={70}
							/>

							<InputHelper
								className="mb-3"
								as="textarea"
								label="What methods do you use?"
								value={methods}
								onChange={(event) => {
									setMethods(event.currentTarget.value);
								}}
								characterCounter={70}
							/>

							<InputHelper
								className="mb-3"
								as="textarea"
								label="What motivates you to do the work you do?"
								value={motivations}
								onChange={(event) => {
									setMotivations(event.currentTarget.value);
								}}
								characterCounter={70}
							/>

							<InputHelper
								className="mb-5"
								as="select"
								label="What are your pronouns?"
								value={pronouns}
								onChange={(event) => {
									setPronouns(event.currentTarget.value);
								}}
							>
								<option>She/her/hers</option>
								<option>He/him/his</option>
							</InputHelper>

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
