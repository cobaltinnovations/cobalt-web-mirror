import React, { useState } from 'react';
import { Button, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import InputHelper from '@/components/input-helper';
import { cloneDeep } from 'lodash';

const GroupSessionsRequest = () => {
	const [interests] = useState([
		{
			id: 'MINDFULNESS',
			title: 'Mindfulness',
			description: 'Description of interest goes here.',
		},
		{
			id: 'MANAGING_STRESS_AND_ANXIETY',
			title: 'Managing Stress and Anxiety',
			description: 'Description of interest goes here.',
		},
		{
			id: 'ENERGY_MANAGEMENT',
			title: 'Energy Management',
			description: 'Description of interest goes here.',
		},
		{
			id: 'FITTING_IN_FITNESS',
			title: 'Fitting in Fitness',
			description: 'Description of interest goes here.',
		},
		{
			id: 'HEALTHY_EATING',
			title: 'Healthy Eating',
			description: 'Description of interest goes here.',
		},
		{
			id: 'TOXIC_POSITIVITY',
			title: `Toxic Positivity: Don't "Just" Get Over It`,
			description: 'Description of interest goes here.',
		},
		{
			id: 'SHOWING_UP_FOR_YOURSELF',
			title: 'Showing Up for Yourself',
			description: 'Description of interest goes here.',
		},
		{
			id: 'TEAM_RELATIONSHIPS',
			title: 'Team Relationships',
			description: 'Description of interest goes here.',
		},
		{
			id: 'SCHEDULING_TOOLS',
			title: 'Scheduling Tools',
			description: 'Description of interest goes here.',
		},
		{
			id: 'HOLISTIC_WELL_BEING',
			title: 'Holistic Well-Being',
			description: 'Description of interest goes here.',
		},
		{
			id: 'OTHER',
			title: 'Other',
		},
	]);
	const [expandedInterestIds, setExpandedInterestIds] = useState<string[]>([]);

	return (
		<Container className="py-14">
			<Row className="mb-8">
				<Col lg={{ span: 8, offset: 2 }}>
					<h1 className="mb-6">Request a Group Session</h1>
					<p className="mb-4">
						Use this form to request a group session for your team (minimum of 5 people). Topics can range
						from mindfulness to resilience to how to increase daily activity. Please request your session at
						least two weeks in advance of the desired date. Upon submission of this form, please allow 1-2
						business days to hear back from the session coordinator. Sessions are held virtually.
					</p>
					<p className="mb-0 text-danger">Requred *</p>
				</Col>
			</Row>
			<Row>
				<Col lg={{ span: 8, offset: 2 }}>
					<Form className="p-8 pb-10 bg-white border rounded">
						<h4 className="mb-8">Session Request Form</h4>
						<div className="mb-8">
							<h6 className="mb-4">Your Contact Information</h6>
							<InputHelper
								className="mb-4"
								required
								type="text"
								value={''}
								label="Name"
								onChange={({ currentTarget }) => {
									console.log(currentTarget);
								}}
							/>
							<InputHelper
								required
								type="email"
								value={''}
								label="Email Address"
								onChange={({ currentTarget }) => {
									console.log(currentTarget);
								}}
							/>
						</div>
						<div className="mb-8">
							<h6 className="mb-1">
								Which topic(s) are you interested in? <span className="text-danger">*</span>
							</h6>
							<p className="mb-2">Select all that apply.</p>
							<Form.Group className="border rounded">
								{interests.map((interest, index) => {
									const isLast = interests.length - 1 === index;

									return (
										<div
											key={interest.id}
											className={classNames({
												'border-bottom': !isLast,
											})}
										>
											<div className="p-4 d-flex align-items-center justify-content-between ">
												<Form.Check
													name="interests"
													id={`interests__${interest.id}`}
													value={interest.id}
													type="checkbox"
													label={interest.title}
												/>
												{interest.description && (
													<Button
														variant="link"
														className="p-0 fs-ui-small fw-normal text-decoration-none"
														onClick={() => {
															const expandedInterestIdsClone =
																cloneDeep(expandedInterestIds);
															const indexToRemove = expandedInterestIdsClone.findIndex(
																(i) => i === interest.id
															);

															if (indexToRemove > -1) {
																expandedInterestIdsClone.splice(indexToRemove, 1);
															} else {
																expandedInterestIdsClone.push(interest.id);
															}

															setExpandedInterestIds(expandedInterestIdsClone);
														}}
													>
														{expandedInterestIds.includes(interest.id)
															? '- Hide Details'
															: '+ View Details'}
													</Button>
												)}
											</div>
											{interest.description && (
												<Collapse in={expandedInterestIds.includes(interest.id)}>
													<div>
														<div className="px-12 pb-6">
															<p className="mb-0">{interest.description}</p>
														</div>
													</div>
												</Collapse>
											)}
										</div>
									);
								})}
							</Form.Group>
						</div>
						<div className="mb-8">
							<h6 className="mb-1">
								Which (if any) dates do you prefer for your session(s)?{' '}
								<span className="text-danger">*</span>
							</h6>
							<p className="mb-4">Enter “No Preference” if there is no preferred date.</p>
							<InputHelper
								as="textarea"
								label="Enter preferred date(s):"
								value={''}
								onChange={({ currentTarget }) => {
									console.log(currentTarget);
								}}
							/>
						</div>
						<div className="mb-8">
							<h6 className="mb-1">
								Confirm the amount of people you expect to attend the session(s){' '}
								<span className="text-danger">*</span>
							</h6>
							<p className="mb-2">We require a minimum of five attendees to schedule group sessions.</p>
							<Form.Group>
								<Form.Check
									name="session-capacity"
									id="session-capacity__five-to-ten"
									type="radio"
									label="5-10"
								/>
								<Form.Check
									name="session-capacity"
									id="session-capacity__ten-to-fifteen"
									type="radio"
									label="10-15"
								/>
								<Form.Check
									name="session-capacity"
									id="session-capacity__fifteen-to-twenty"
									type="radio"
									label="15-20"
								/>
								<Form.Check
									name="session-capacity"
									id="session-capacity__twenty-to-twenty-five"
									type="radio"
									label="20-25"
								/>
								<Form.Check
									name="session-capacity"
									id="session-capacity__more-than-twenty-five"
									type="radio"
									label="More than 25"
								/>
							</Form.Group>
						</div>
						<div className="mb-10">
							<h6 className="mb-4">Other Details</h6>
							<InputHelper
								as="textarea"
								label="Is there anything specific about your group you’d like us to know?"
								value={''}
								onChange={({ currentTarget }) => {
									console.log(currentTarget);
								}}
							/>
						</div>
						<div className="text-right">
							<Button type="submit">Submit Request</Button>
						</div>
					</Form>
				</Col>
			</Row>
		</Container>
	);
};

export default GroupSessionsRequest;
