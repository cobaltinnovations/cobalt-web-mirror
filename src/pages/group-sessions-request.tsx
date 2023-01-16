import React, { useCallback, useState } from 'react';
import { Button, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import InputHelper from '@/components/input-helper';
import { cloneDeep } from 'lodash';

const GroupSessionsRequest = () => {
	const [topics] = useState([
		{
			id: 'MINDFULNESS',
			title: 'Mindfulness',
			description: 'Description of topic goes here.',
		},
		{
			id: 'MANAGING_STRESS_AND_ANXIETY',
			title: 'Managing Stress and Anxiety',
			description: 'Description of topic goes here.',
		},
		{
			id: 'ENERGY_MANAGEMENT',
			title: 'Energy Management',
			description: 'Description of topic goes here.',
		},
		{
			id: 'FITTING_IN_FITNESS',
			title: 'Fitting in Fitness',
			description: 'Description of topic goes here.',
		},
		{
			id: 'HEALTHY_EATING',
			title: 'Healthy Eating',
			description: 'Description of topic goes here.',
		},
		{
			id: 'TOXIC_POSITIVITY',
			title: `Toxic Positivity: Don't "Just" Get Over It`,
			description: 'Description of topic goes here.',
		},
		{
			id: 'SHOWING_UP_FOR_YOURSELF',
			title: 'Showing Up for Yourself',
			description: 'Description of topic goes here.',
		},
		{
			id: 'TEAM_RELATIONSHIPS',
			title: 'Team Relationships',
			description: 'Description of topic goes here.',
		},
		{
			id: 'SCHEDULING_TOOLS',
			title: 'Scheduling Tools',
			description: 'Description of topic goes here.',
		},
		{
			id: 'HOLISTIC_WELL_BEING',
			title: 'Holistic Well-Being',
			description: 'Description of topic goes here.',
		},
		{
			id: 'OTHER',
			title: 'Other',
		},
	]);
	const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>([]);
	const [capacities] = useState([
		{
			id: 'FIVE_TO_TEN',
			title: '5-10',
		},
		{
			id: 'TEN_TO_FIFTEEN',
			title: '10-15',
		},
		{
			id: 'FIFTEEN_TO_TWENTY',
			title: '15-20',
		},
		{
			id: 'TWENTY_TO_TWENTY_FIVE',
			title: '20-25',
		},
		{
			id: 'MORE_THAN_TWENTY_FIVE',
			title: 'More than 25',
		},
	]);
	const [formValues, setFormValues] = useState({
		name: '',
		emailAddress: '',
		topicIds: [] as string[],
		otherTopics: '',
		preferredDates: '',
		capacity: 'FIVE_TO_TEN',
		otherDetails: '',
	});

	const handleFormSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			console.log(formValues);
		},
		[formValues]
	);

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
					<Form className="p-8 pb-10 bg-white border rounded" onSubmit={handleFormSubmit}>
						<h4 className="mb-8">Session Request Form</h4>
						<div className="mb-8">
							<h6 className="mb-4">Your Contact Information</h6>
							<InputHelper
								className="mb-4"
								required
								type="text"
								value={formValues.name}
								label="Name"
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										name: currentTarget.value,
									}));
								}}
							/>
							<InputHelper
								required
								type="email"
								value={formValues.emailAddress}
								label="Email Address"
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										emailAddress: currentTarget.value,
									}));
								}}
							/>
						</div>
						<div className="mb-8">
							<h6 className="mb-1">
								Which topic(s) are you interested in? <span className="text-danger">*</span>
							</h6>
							<p className="mb-2">Select all that apply.</p>
							<Form.Group className="border rounded">
								{topics.map((topic, index) => {
									const isLast = topics.length - 1 === index;

									return (
										<div
											key={topic.id}
											className={classNames({
												'border-bottom': !isLast,
											})}
										>
											<div className="p-4 d-flex align-items-center justify-content-between ">
												<Form.Check
													name="interests"
													id={`interests__${topic.id}`}
													value={topic.id}
													type="checkbox"
													label={topic.title}
													checked={formValues.topicIds.includes(topic.id)}
													onChange={({ currentTarget }) => {
														const topicIdsClone = cloneDeep(formValues.topicIds);
														const indexToRemove = topicIdsClone.findIndex(
															(i) => i === currentTarget.value
														);

														if (indexToRemove > -1) {
															topicIdsClone.splice(indexToRemove, 1);
														} else {
															topicIdsClone.push(currentTarget.value);
														}

														setFormValues((previousValue) => ({
															...previousValue,
															topicIds: topicIdsClone,
														}));
													}}
												/>
												{topic.description && (
													<Button
														variant="link"
														className="p-0 fs-ui-small fw-normal text-decoration-none"
														onClick={() => {
															const expandedTopicIdsClone = cloneDeep(expandedTopicIds);
															const indexToRemove = expandedTopicIdsClone.findIndex(
																(i) => i === topic.id
															);

															if (indexToRemove > -1) {
																expandedTopicIdsClone.splice(indexToRemove, 1);
															} else {
																expandedTopicIdsClone.push(topic.id);
															}

															setExpandedTopicIds(expandedTopicIdsClone);
														}}
													>
														{expandedTopicIds.includes(topic.id)
															? '- Hide Details'
															: '+ View Details'}
													</Button>
												)}
											</div>
											{topic.description && (
												<Collapse in={expandedTopicIds.includes(topic.id)}>
													<div>
														<div className="ps-12 pe-6 pb-6">
															<p className="mb-0">{topic.description}</p>
														</div>
													</div>
												</Collapse>
											)}
											{topic.id === 'OTHER' && (
												<Collapse in={formValues.topicIds.includes('OTHER')}>
													<div>
														<div className="ps-12 pe-6 pb-6">
															<InputHelper
																required={formValues.topicIds.includes('OTHER')}
																type="text"
																value={formValues.otherTopics}
																label="Other Topics"
																onChange={({ currentTarget }) => {
																	setFormValues((previousValue) => ({
																		...previousValue,
																		otherTopics: currentTarget.value,
																	}));
																}}
															/>
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
								value={formValues.preferredDates}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										preferredDates: currentTarget.value,
									}));
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
								{capacities.map((capacity) => {
									return (
										<Form.Check
											key={capacity.id}
											type="radio"
											name="capacity"
											id={`capacity__${capacity.id}`}
											value={capacity.id}
											label={capacity.title}
											checked={formValues.capacity === capacity.id}
											onChange={({ currentTarget }) => {
												setFormValues((previousValue) => ({
													...previousValue,
													capacity: currentTarget.value,
												}));
											}}
										/>
									);
								})}
							</Form.Group>
						</div>
						<div className="mb-10">
							<h6 className="mb-4">Other Details</h6>
							<InputHelper
								as="textarea"
								label="Is there anything specific about your group you'd like us to know?"
								value={formValues.otherDetails}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => ({
										...previousValue,
										otherDetails: currentTarget.value,
									}));
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
