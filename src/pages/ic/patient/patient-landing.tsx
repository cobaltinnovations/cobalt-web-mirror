import NoData from '@/components/no-data';
import React, { useCallback, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import CallToAction from '@/components/call-to-action';
import { ReactComponent as ManAtDeskIllustration } from '@/assets/illustrations/man-at-desk.svg';
import { ReactComponent as WomanAtDeskIllustration } from '@/assets/illustrations/woman-at-desk.svg';

enum HOMESCREEN_STATES {
	AWAITING_PATIENT_ORDER = 'AWAITING_PATIENT_ORDER',
	ASSESSMENT_READY = 'ASSESSMENT_READY',
	ASSESSMENT_IN_PROGRESS = 'ASSESSMENT_IN_PROGRESS',
	ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
}

const homescreenStates = [
	{
		homescreenStateId: HOMESCREEN_STATES.AWAITING_PATIENT_ORDER,
		title: 'Awaiting Patient Order',
	},
	{
		homescreenStateId: HOMESCREEN_STATES.ASSESSMENT_READY,
		title: 'Assessment Ready',
	},
	{
		homescreenStateId: HOMESCREEN_STATES.ASSESSMENT_IN_PROGRESS,
		title: 'Assessment In Progress',
	},
	{
		homescreenStateId: HOMESCREEN_STATES.ASSESSMENT_COMPLETE,
		title: 'Assessment Complete',
	},
];

const Homescreen = () => {
	const { institution } = useAccount();
	const [homescreenState, setHomescreenState] = useState(HOMESCREEN_STATES.AWAITING_PATIENT_ORDER);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getOpenOrderForCurrentPatient().fetch();
		console.log(response);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<HeroContainer>
				<h1 className="text-center">Welcome back, [firstName]</h1>
			</HeroContainer>

			<Container className="pt-10">
				<Row>
					<Col>
						<Form>
							<Form.Label className="mb-2">Homescreen State (For Dev Only)</Form.Label>
							<Form.Group>
								{homescreenStates.map((hs) => (
									<Form.Check
										inline
										key={hs.homescreenStateId}
										type="radio"
										name="homescreen-state"
										id={`homescreen-state--${hs.homescreenStateId}`}
										value={hs.homescreenStateId}
										label={hs.title}
										checked={homescreenState === hs.homescreenStateId}
										onChange={({ currentTarget }) => {
											setHomescreenState(currentTarget.value as HOMESCREEN_STATES);
										}}
									/>
								))}
							</Form.Group>
						</Form>
					</Col>
				</Row>
			</Container>

			{homescreenState === HOMESCREEN_STATES.AWAITING_PATIENT_ORDER && (
				<Container className="py-14">
					<Row>
						<Col>
							<NoData
								title="Awaiting Patient Order"
								description="We are waiting on your patient order to come through. You will be sent an email when we are ready for you to take the assessment. In the meantime, you can check out our self-help resources for articles, podcasts, videos and more."
								actions={[
									{
										variant: 'primary',
										title: 'Browse self-help resources',
										onClick: () => {
											window.alert('[TODO]');
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			)}

			{homescreenState === HOMESCREEN_STATES.ASSESSMENT_READY && (
				<Container className="py-10">
					<Row>
						<Col>
							<NoData
								illustration={<ManAtDeskIllustration />}
								className="bg-white"
								title="Get Personalized Recommendations"
								description="Dr. James Wong suggested you are interested in receiving support for your mental health. Please take our assessment so we can determine what type of care is best for you."
								actions={[
									{
										variant: 'primary',
										title: 'Take the Assessment',
										onClick: () => {
											window.alert('[TODO]');
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			)}

			{homescreenState === HOMESCREEN_STATES.ASSESSMENT_IN_PROGRESS && (
				<Container className="py-10">
					<Row>
						<Col>
							<NoData
								illustration={<WomanAtDeskIllustration />}
								className="bg-white"
								title="Continue with Assessment"
								description="You previously made progress on the assessment. We'll pick up where you left off. Before we start, please make sure you are in a comfortable place. Is now a good time?"
								actions={[
									{
										variant: 'primary',
										title: 'Continue Assessment',
										onClick: () => {
											window.alert('[TODO]');
										},
									},
									{
										variant: 'outline-primary',
										title: 'Restart from Beginning',
										onClick: () => {
											window.alert('[TODO]');
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			)}

			{homescreenState === HOMESCREEN_STATES.ASSESSMENT_COMPLETE && (
				<Container className="py-10">
					<Row>
						<Col>
							<CallToAction
								callToAction={{
									message:
										'Cobalt Recommendations. Based on your assessment results, we think the following would be beneficial to you: 1) Talk to a therapist. 2) View Crisis Resources for immediate help.',
									messageAsHtml: `<h4 class="mb-2">Cobalt Recommendations</h4>
                                        <p class="mb-2 fs-large">
                                            Based on your assessment results, we think the following would be beneficial to you:
                                        </p>
                                        <ul class="mb-0">
                                            <li class="mb-2">
                                                <p class="mb-0 fs-large">
                                                    Talk to a therapist <a class="fw-normal" href="/#">Learn more</a>
                                                </p>
                                            </li>
                                            <li>
                                                <p class="mb-0 fs-large">
                                                    View <a class="fw-normal" href="/#">Crisis Resources</a> for immediate help
                                                </p>
                                            </li>
                                        </ul>`,
									actionLinks: [],
									modalButtonText: '',
									modalMessage: '',
									modalMessageAsHtml: '',
								}}
							/>
						</Col>
					</Row>
				</Container>
			)}
		</AsyncWrapper>
	);
};

export default Homescreen;
