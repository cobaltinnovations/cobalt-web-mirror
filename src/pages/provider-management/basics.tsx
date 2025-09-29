import React, { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import useAccount from '@/hooks/use-account';

interface RoleModel {
	roleId: string;
	title: string;
}

export const ProviderManagementBasics = (): ReactElement => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [title, setTitle] = useState('');

	const [roleOptions] = useState<RoleModel[]>([
		{
			roleId: 'xxxx-xxxx-xxxx-xxx0',
			title: 'Role 0',
		},
		{
			roleId: 'xxxx-xxxx-xxxx-xxx1',
			title: 'Role 1',
		},
		{
			roleId: 'xxxx-xxxx-xxxx-xxx2',
			title: 'Role 2',
		},
	]);
	const [roleSelections, setRoleSelections] = useState<RoleModel[]>([]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Provider Details - The Basics</title>
			</Helmet>

			<Container className="py-8">
				<Row className="mb-6">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3>the basics</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form onSubmit={handleSubmit}>
							<InputHelper
								className="mb-1"
								type="text"
								label="Name"
								value={name}
								onChange={(event) => {
									setName(event.currentTarget.value);
								}}
								required
							/>

							<InputHelper
								className="mb-1"
								type="email"
								label="Email"
								value={email}
								onChange={(event) => {
									setEmail(event.currentTarget.value);
								}}
								required
							/>

							<InputHelper
								className="mb-1"
								type="text"
								label="Title"
								value={title}
								onChange={(event) => {
									setTitle(event.currentTarget.value);
								}}
								required
							/>

							<TypeaheadHelper
								className="mb-5"
								id="role-type-ahead"
								label="Roles"
								required
								multiple
								labelKey="title"
								options={roleOptions}
								selected={roleSelections}
								onChange={(options) => {
									setRoleSelections(options as RoleModel[]);
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
		</>
	);
};
