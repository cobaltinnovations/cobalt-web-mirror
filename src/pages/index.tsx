import Cookies from 'js-cookie';
import React, { FC, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import useHeaderTitle from '@/hooks/use-header-title';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import StudioEvent from '@/components/studio-event';
import OnYourTimeItem from '@/components/on-your-time-item';

import { recommendationsService, groupSessionsService, accountService } from '@/lib/services';
import { GroupEvent, Content, GroupSessionModel } from '@/lib/models';

import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useIndexStyles = createUseThemedStyles((theme) => ({
	calendarIcon: {
		top: -1,
		marginRight: 10,
		position: 'relative',
	},
}));

const Index: FC = () => {
	useHeaderTitle(null);
	const { account, institution } = useAccount();

	const navigate = useNavigate();
	const classes = useIndexStyles();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupEvent | GroupSessionModel)[]>([]);
	const [onYourTimeContent, setOnYourTimeContent] = useState<Content[]>([]);

	const accountId = account?.accountId;
	const fetchData = useCallback(async () => {
		if (!accountId) return;

		const response = await recommendationsService.getRecommendations(accountId).fetch();

		setInTheStudioEvents([...response.groupSessions, ...response.groupEvents]);
		setOnYourTimeContent(response.contents);

		const roleId = Cookies.get('roleId');
		if (roleId) {
			try {
				await accountService.postRoleRequest(accountId, roleId).fetch();
				Cookies.remove('roleId');
			} catch (error) {
				// dont throw
			}
		}
	}, [accountId]);

	function handleConnectWithSupportButtonClick() {
		navigate('/connect-with-support');
	}

	return (
		<AsyncPage fetchData={fetchData}>
			{institution?.supportEnabled && (
				<HeroContainer className="text-center">
					<h1 className="mb-3">Recommended for you</h1>
					<p className="mb-5">
						Peers, Resilience Coaches, Therapists, Psychiatrists, and more are here to help
					</p>
					<Button onClick={handleConnectWithSupportButtonClick}>
						<CalendarIcon className={classes.calendarIcon} />
						Connect with support
					</Button>
				</HeroContainer>
			)}

			{inTheStudioEvents.length > 0 && (
				<>
					<Container className="pt-20">
						<Row>
							<Col>
								<h3 className="mb-2">In the studio</h3>
							</Col>
						</Row>
					</Container>
					<Container>
						<Row>
							<Col>
								<Carousel
									responsive={responsiveDefaults}
									description="Explainer text goes here. What is in the studio?"
									calloutTitle="Explore all"
									calloutOnClick={() => {
										navigate('/in-the-studio');
									}}
								>
									{inTheStudioEvents.map((inTheStudioEvent) => {
										if (groupSessionsService.isGroupSession(inTheStudioEvent)) {
											return (
												<Link
													key={inTheStudioEvent.groupSessionId}
													className="text-decoration-none"
													to={`/in-the-studio/group-session-scheduled/${inTheStudioEvent.groupSessionId}`}
												>
													<StudioEvent groupEvent={inTheStudioEvent} />
												</Link>
											);
										}

										return (
											<Link
												key={inTheStudioEvent.groupEventId}
												className="text-decoration-none"
												to={`/in-the-studio/${inTheStudioEvent.groupEventId}`}
											>
												<StudioEvent groupEvent={inTheStudioEvent} />
											</Link>
										);
									})}
								</Carousel>
							</Col>
						</Row>
					</Container>
				</>
			)}

			<Container className="pt-20">
				<Row>
					<Col>
						<h3 className="mb-2">On your time</h3>
					</Col>
				</Row>
			</Container>
			<Container>
				<Row>
					<Col>
						<Carousel
							responsive={responsiveDefaults}
							description="Explainer text goes here. What is on your time?"
							calloutTitle="Explore all"
							calloutOnClick={() => {
								navigate('/on-your-time');
							}}
						>
							{onYourTimeContent.map((onYourOwnTimeItem) => {
								return (
									<Link
										key={onYourOwnTimeItem.contentId}
										to={`/on-your-time/${onYourOwnTimeItem.contentId}`}
										className="d-block mb-2 text-decoration-none"
									>
										<OnYourTimeItem
											imageUrl={onYourOwnTimeItem.imageUrl}
											tag={onYourOwnTimeItem.newFlag ? 'NEW' : ''}
											title={onYourOwnTimeItem.title}
											type={onYourOwnTimeItem.contentTypeLabel}
											author={onYourOwnTimeItem.author}
											duration={onYourOwnTimeItem.duration}
										/>
									</Link>
								);
							})}
						</Carousel>
					</Col>
				</Row>
			</Container>

			<Container className="pb-20">
				<Row>
					<Col>
						<div className="d-flex justify-content-center mb-4">
							<Button
								variant="light"
								onClick={() => {
									navigate('/on-your-time', { state: { personalize: true } });
								}}
							>
								Personalize recommendations
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default Index;
