import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { cloneDeep } from 'lodash';

interface DegreeModel {
	degree: string;
	inWhat: string;
	fromWhere: string;
}

interface SpecialtyModel {
	specialtyId: string;
	title: string;
}

interface WorkplaceModel {
	workplaceId: string;
	title: string;
}

interface AtModel {
	atId: string;
	title: string;
}

interface InTheModel {
	inTheId: string;
	title: string;
}

export const ProviderManagementClinicalBackground = (): ReactElement => {
	const history = useHistory();

	const [degrees, setDegrees] = useState<DegreeModel[]>([
		{
			degree: '',
			inWhat: '',
			fromWhere: '',
		},
	]);

	const [specialtyOptions] = useState<SpecialtyModel[]>([
		{
			specialtyId: 'xxxx-xxxx-xxxx-xxx0',
			title: 'Specialty 0',
		},
		{
			specialtyId: 'xxxx-xxxx-xxxx-xxx1',
			title: 'Specialty 1',
		},
		{
			specialtyId: 'xxxx-xxxx-xxxx-xxx2',
			title: 'Specialty 2',
		},
	]);
	const [specialtySelections, setSpecialtySelections] = useState<SpecialtyModel[]>([]);

	const [workplaceOptions] = useState<WorkplaceModel[]>([
		{
			workplaceId: 'xxxx-xxxx-xxxx-xxx0',
			title: 'Workplace 0',
		},
		{
			workplaceId: 'xxxx-xxxx-xxxx-xxx1',
			title: 'Workplace 1',
		},
		{
			workplaceId: 'xxxx-xxxx-xxxx-xxx2',
			title: 'Workplace 2',
		},
	]);
	const [workplaceSelections, setWorkplaceSelections] = useState<WorkplaceModel[]>([]);

	const [atOptions] = useState<AtModel[]>([
		{
			atId: 'xxxx-xxxx-xxxx-xxx0',
			title: 'at 0',
		},
		{
			atId: 'xxxx-xxxx-xxxx-xxx1',
			title: 'at 1',
		},
		{
			atId: 'xxxx-xxxx-xxxx-xxx2',
			title: 'at 2',
		},
	]);
	const [atSelections, setAtSelections] = useState<AtModel[]>([]);

	const [inTheOptions] = useState<InTheModel[]>([
		{
			inTheId: 'xxxx-xxxx-xxxx-xxx0',
			title: 'in the 0',
		},
		{
			inTheId: 'xxxx-xxxx-xxxx-xxx1',
			title: 'in the 1',
		},
		{
			inTheId: 'xxxx-xxxx-xxxx-xxx2',
			title: 'in the 2',
		},
	]);
	const [inTheSelections, setInTheSelections] = useState<InTheModel[]>([]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<Container className="py-8">
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3>clinical background</h3>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Form onSubmit={handleSubmit}>
						{degrees.map((degree, index) => {
							return (
								<div key={index} className="mb-3">
									<Row>
										<Col xs={4}>
											<InputHelper
												className="mb-1"
												type="text"
												label="Degree"
												value={degree.degree}
												onChange={(event) => {
													const degreesClone = cloneDeep(degrees);
													degreesClone[index].degree = event.currentTarget.value;
													setDegrees(degreesClone);
												}}
												required
											/>
										</Col>
										<Col xs={8}>
											<InputHelper
												className="mb-1"
												type="text"
												label="In what? (Optional)"
												value={degree.inWhat}
												onChange={(event) => {
													const degreesClone = cloneDeep(degrees);
													degreesClone[index].inWhat = event.currentTarget.value;
													setDegrees(degreesClone);
												}}
											/>
										</Col>
									</Row>
									<InputHelper
										type="text"
										label="From where?"
										value={degree.fromWhere}
										onChange={(event) => {
											const degreesClone = cloneDeep(degrees);
											degreesClone[index].fromWhere = event.currentTarget.value;
											setDegrees(degreesClone);
										}}
										required
									/>
									{index !== 0 && (
										<div className="mt-1 text-end">
											<Button
												className="p-0"
												variant="link"
												size="sm"
												onClick={() => {
													const degreesClone = cloneDeep(degrees);
													degreesClone.splice(index, 1);
													setDegrees(degreesClone);
												}}
											>
												Remove this degree
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
								const degreesClone = cloneDeep(degrees);
								degreesClone.push({
									degree: '',
									inWhat: '',
									fromWhere: '',
								});

								setDegrees(degreesClone);
							}}
						>
							Add a degree
						</Button>

						<TypeaheadHelper
							className="mb-1"
							id="specialty-typeahead"
							label="Specialty"
							required
							multiple
							labelKey="title"
							options={specialtyOptions}
							selected={specialtySelections}
							onChange={(options) => {
								setSpecialtySelections(options as SpecialtyModel[]);
							}}
						/>

						<TypeaheadHelper
							className="mb-1"
							id="workplace-typeahead"
							label="Where do they work?"
							required
							labelKey="title"
							options={workplaceOptions}
							selected={workplaceSelections}
							onChange={(options) => {
								setWorkplaceSelections(options as WorkplaceModel[]);
							}}
							allowNew
						/>

						<TypeaheadHelper
							className="mb-1"
							id="at-typeahead"
							label="at..."
							required
							labelKey="title"
							options={atOptions}
							selected={atSelections}
							onChange={(options) => {
								setAtSelections(options as AtModel[]);
							}}
							allowNew
						/>

						<TypeaheadHelper
							className="mb-5"
							id="in-the-typeahead"
							label="in the..."
							required
							labelKey="title"
							options={inTheOptions}
							selected={inTheSelections}
							onChange={(options) => {
								setInTheSelections(options as InTheModel[]);
							}}
							allowNew
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
