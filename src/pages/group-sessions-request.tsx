import React, { useCallback, useState } from 'react';
import { Button, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import InputHelper from '@/components/input-helper';
import { cloneDeep } from 'lodash';
import { GroupTopic } from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import useHandleError from '@/hooks/use-handle-error';
import { Link } from 'react-router-dom';

enum ATTENDEE_COUNTS {
	FIVE_TO_TEN = 'FIVE_TO_TEN',
	TEN_TO_FIFTEEN = 'TEN_TO_FIFTEEN',
	FIFTEEN_TO_TWENTY = 'FIFTEEN_TO_TWENTY',
	TWENTY_TO_TWENTY_FIVE = 'TWENTY_TO_TWENTY_FIVE',
	MORE_THAN_TWENTY_FIVE = 'MORE_THAN_TWENTY_FIVE',
}

const attendeeCounts = {
	[ATTENDEE_COUNTS.FIVE_TO_TEN]: {
		attendeeCountId: ATTENDEE_COUNTS.FIVE_TO_TEN,
		name: '5-10',
		minimumAttendeeCount: 5,
		maximumAttendeeCount: 10,
	},
	[ATTENDEE_COUNTS.TEN_TO_FIFTEEN]: {
		attendeeCountId: ATTENDEE_COUNTS.TEN_TO_FIFTEEN,
		name: '10-15',
		minimumAttendeeCount: 10,
		maximumAttendeeCount: 15,
	},
	[ATTENDEE_COUNTS.FIFTEEN_TO_TWENTY]: {
		attendeeCountId: ATTENDEE_COUNTS.FIFTEEN_TO_TWENTY,
		name: '15-20',
		minimumAttendeeCount: 15,
		maximumAttendeeCount: 20,
	},
	[ATTENDEE_COUNTS.TWENTY_TO_TWENTY_FIVE]: {
		attendeeCountId: ATTENDEE_COUNTS.TWENTY_TO_TWENTY_FIVE,
		name: '20-25',
		minimumAttendeeCount: 20,
		maximumAttendeeCount: 25,
	},
	[ATTENDEE_COUNTS.MORE_THAN_TWENTY_FIVE]: {
		attendeeCountId: ATTENDEE_COUNTS.MORE_THAN_TWENTY_FIVE,
		name: 'More than 25',
		minimumAttendeeCount: 25,
		maximumAttendeeCount: Infinity,
	},
};

const GroupSessionsRequest = () => {
	const handleError = useHandleError();
	const [groupTopics, setGroupTopics] = useState<GroupTopic[]>([]);
	const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>([]);
	const [formValues, setFormValues] = useState({
		requestorName: '',
		requestorEmailAddress: '',
		groupTopicIds: [] as string[],
		otherGroupTopicChecked: false,
		otherGroupTopicsDescription: '',
		preferredDateDescription: '',
		preferredTimeDescription: '',
		attendeeCountId: ATTENDEE_COUNTS.FIVE_TO_TEN,
		minimumAttendeeCount: 0,
		maximumAttendeeCount: 0,
		additionalDescription: '',
	});
	const [formIsSubmitting, setFormIsSubmitting] = useState(false);
	const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);

	const fetchData = useCallback(async () => {
		// TODO: Waiting on BE for this endpoint
		// const response = await groupSessionsService.getGroupTopics().fetch();
		// TODO: replace setState with `response.groupTopics`

		setGroupTopics([
			{
				groupTopicId: 'MINDFULNESS',
				name: 'Mindfulness',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'MANAGING_STRESS_AND_ANXIETY',
				name: 'Managing Stress and Anxiety',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'ENERGY_MANAGEMENT',
				name: 'Energy Management',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'FITTING_IN_FITNESS',
				name: 'Fitting in Fitness',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'HEALTHY_EATING',
				name: 'Healthy Eating',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'TOXIC_POSITIVITY',
				name: `Toxic Positivity: Don't "Just" Get Over It`,
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'SHOWING_UP_FOR_YOURSELF',
				name: 'Showing Up for Yourself',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'TEAM_RELATIONSHIPS',
				name: 'Team Relationships',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'SCHEDULING_TOOLS',
				name: 'Scheduling Tools',
				description: 'Description of topic goes here.',
			},
			{
				groupTopicId: 'HOLISTIC_WELL_BEING',
				name: 'Holistic Well-Being',
				description: 'Description of topic goes here.',
			},
		]);
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			const {
				requestorName,
				requestorEmailAddress,
				preferredDateDescription,
				preferredTimeDescription,
				minimumAttendeeCount,
				maximumAttendeeCount,
				additionalDescription,
				otherGroupTopicsDescription,
				groupTopicIds,
			} = formValues;

			try {
				setFormIsSubmitting(true);

				await groupSessionsService
					.postGroupRequest({
						requestorName,
						requestorEmailAddress,
						...(preferredDateDescription && { preferredDateDescription }),
						...(preferredTimeDescription && { preferredTimeDescription }),
						minimumAttendeeCount,
						...(maximumAttendeeCount !== Infinity && { maximumAttendeeCount }),
						...(additionalDescription && { additionalDescription }),
						...(otherGroupTopicsDescription && { otherGroupTopicsDescription }),
						groupTopicIds,
					})
					.fetch();

				setFormSubmittedSuccessfully(true);
			} catch (error) {
				handleError(error);
				setFormSubmittedSuccessfully(false);
			} finally {
				setFormIsSubmitting(false);
			}
		},
		[formValues, handleError]
	);

	if (formSubmittedSuccessfully) {
		return (
			<Container className="py-20">
				<Row>
					<Col lg={{ span: 6, offset: 3 }}>
						<div className="p-14 bg-white border rounded">
							<h3 className="mb-7 text-center">Thank you for your interest!</h3>
							<p className="mb-7 fs-large text-center">
								Your request has been submitted, and a session coordinator will contact you within 1-2
								business days.
							</p>
							<p className="mb-7 fs-large text-center">
								<Link to="/group-sessions" className="fw-normal">
									Explore more Group Sessions
								</Link>
							</p>
							<p className="mb-0 fs-large text-center">
								<Link to="/" className="fw-normal">
									Back to Home
								</Link>
							</p>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-14">
				<Row className="mb-8">
					<Col lg={{ span: 8, offset: 2 }}>
						<h1 className="mb-6">Request a Group Session</h1>
						<p className="mb-4">
							Use this form to request a group session for your team (minimum of 5 people). Topics can
							range from mindfulness to resilience to how to increase daily activity. Please request your
							session at least two weeks in advance of the desired date. Upon submission of this form,
							please allow 1-2 business days to hear back from the session coordinator. Sessions are held
							virtually.
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
									value={formValues.requestorName}
									label="Name"
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											requestorName: currentTarget.value,
										}));
									}}
									disabled={formIsSubmitting}
								/>
								<InputHelper
									required
									type="email"
									value={formValues.requestorEmailAddress}
									label="Email Address"
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											requestorEmailAddress: currentTarget.value,
										}));
									}}
									disabled={formIsSubmitting}
								/>
							</div>
							<div className="mb-8">
								<h6 className="mb-1">
									Which topic(s) are you interested in? <span className="text-danger">*</span>
								</h6>
								<p className="mb-2">Select all that apply.</p>
								<Form.Group className="border rounded">
									{groupTopics.map((topic, index) => {
										return (
											<div key={topic.groupTopicId} className="border-bottom">
												<div className="p-4 d-flex align-items-center justify-content-between">
													<Form.Check
														name="interests"
														id={`interests__${topic.groupTopicId}`}
														value={topic.groupTopicId}
														type="checkbox"
														label={topic.name}
														checked={formValues.groupTopicIds.includes(topic.groupTopicId)}
														onChange={({ currentTarget }) => {
															const topicIdsClone = cloneDeep(formValues.groupTopicIds);
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
																groupTopicIds: topicIdsClone,
															}));
														}}
														disabled={formIsSubmitting}
													/>
													{topic.description && (
														<Button
															variant="link"
															className="p-0 fs-ui-small fw-normal text-decoration-none"
															onClick={() => {
																const expandedTopicIdsClone =
																	cloneDeep(expandedTopicIds);
																const indexToRemove = expandedTopicIdsClone.findIndex(
																	(i) => i === topic.groupTopicId
																);

																if (indexToRemove > -1) {
																	expandedTopicIdsClone.splice(indexToRemove, 1);
																} else {
																	expandedTopicIdsClone.push(topic.groupTopicId);
																}

																setExpandedTopicIds(expandedTopicIdsClone);
															}}
														>
															{expandedTopicIds.includes(topic.groupTopicId)
																? '- Hide Details'
																: '+ View Details'}
														</Button>
													)}
												</div>
												{topic.description && (
													<Collapse in={expandedTopicIds.includes(topic.groupTopicId)}>
														<div>
															<div className="ps-12 pe-6 pb-6">
																<p className="mb-0">{topic.description}</p>
															</div>
														</div>
													</Collapse>
												)}
											</div>
										);
									})}
									<div>
										<div className="p-4 d-flex align-items-center justify-content-between">
											<Form.Check
												name="interests"
												id="interests__OTHER"
												value="OTHER"
												type="checkbox"
												label="Other"
												checked={formValues.otherGroupTopicChecked}
												onChange={({ currentTarget }) => {
													setFormValues((previousValue) => ({
														...previousValue,
														otherGroupTopicChecked: currentTarget.checked,
													}));
												}}
												disabled={formIsSubmitting}
											/>
										</div>
										<Collapse in={formValues.otherGroupTopicChecked}>
											<div>
												<div className="ps-12 pe-6 pb-6">
													<InputHelper
														required={formValues.otherGroupTopicChecked}
														type="text"
														value={formValues.otherGroupTopicsDescription}
														label="Other Topics"
														onChange={({ currentTarget }) => {
															setFormValues((previousValue) => ({
																...previousValue,
																otherGroupTopicsDescription: currentTarget.value,
															}));
														}}
														disabled={formIsSubmitting}
													/>
												</div>
											</div>
										</Collapse>
									</div>
								</Form.Group>
							</div>
							<div className="mb-8">
								<h6 className="mb-1">Which (if any) dates do you prefer for your session(s)?</h6>
								<p className="mb-4">Enter “No Preference” if there is no preferred date.</p>
								<InputHelper
									as="textarea"
									label="Enter preferred date(s):"
									value={formValues.preferredDateDescription}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											preferredDateDescription: currentTarget.value,
										}));
									}}
									disabled={formIsSubmitting}
								/>
							</div>
							<div className="mb-8">
								<h6 className="mb-1">What time of day do you prefer for your session(s)?</h6>
								<p className="mb-4">Enter “No Preference” if there is no preferred date.</p>
								<InputHelper
									as="textarea"
									label="Enter preferred times(s):"
									value={formValues.preferredTimeDescription}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											preferredTimeDescription: currentTarget.value,
										}));
									}}
									disabled={formIsSubmitting}
								/>
							</div>
							<div className="mb-8">
								<h6 className="mb-1">
									Confirm the amount of people you expect to attend the session(s){' '}
									<span className="text-danger">*</span>
								</h6>
								<p className="mb-2">
									We require a minimum of five attendees to schedule group sessions.
								</p>
								<Form.Group>
									{Object.values(attendeeCounts).map((attendeeCount) => {
										return (
											<Form.Check
												key={attendeeCount.attendeeCountId}
												type="radio"
												name="attendee-count"
												id={`attendee-count__${attendeeCount.attendeeCountId}`}
												value={attendeeCount.attendeeCountId}
												label={attendeeCount.name}
												checked={formValues.attendeeCountId === attendeeCount.attendeeCountId}
												onChange={() => {
													const {
														attendeeCountId,
														minimumAttendeeCount,
														maximumAttendeeCount,
													} = attendeeCounts[attendeeCount.attendeeCountId];

													setFormValues((previousValue) => ({
														...previousValue,
														attendeeCountId,
														minimumAttendeeCount,
														maximumAttendeeCount,
													}));
												}}
												disabled={formIsSubmitting}
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
									value={formValues.additionalDescription}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											additionalDescription: currentTarget.value,
										}));
									}}
									disabled={formIsSubmitting}
								/>
							</div>
							<div className="text-right">
								<Button type="submit" disabled={formIsSubmitting}>
									Submit Request
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default GroupSessionsRequest;
