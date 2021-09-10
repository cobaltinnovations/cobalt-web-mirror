import React, { FC, useState, useCallback } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import useHeaderTitle from '@/hooks/use-header-title';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import StudioEvent from '@/components/studio-event';
import OnYourTimeItem from '@/components/on-your-time-item';

import { recommendationsService, groupSessionsService } from '@/lib/services';
import { GroupEvent, Content, GroupSessionModel } from '@/lib/models';

import colors from '@/jss/colors';

import { ReactComponent as ChevronLeft } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as ChevronRight } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { isPicMhicAccount } from './pic/utils';
import useSubdomain from '@/hooks/use-subdomain';

const useIndexStyles = createUseStyles({
	inTheStudioContainer: {
		backgroundColor: colors.white,
	},
	carouselImage: {
		width: '100%',
		paddingBottom: '56.25%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: colors.gray300,
	},
	carouselCaption: {
		padding: '10px 20px 48px',
		backgroundColor: colors.white,
	},
	horizontalScrollerTileContent: {
		padding: 16,
	},
	calendarIcon: {
		top: -1,
		marginRight: 10,
		position: 'relative',
	},
});

const Index: FC = () => {
	useHeaderTitle(null);
	const subdomain = useSubdomain();
	const { account, institution } = useAccount();

	const history = useHistory();
	const classes = useIndexStyles();

	const [inTheStudioEvents, setInTheStudioEvents] = useState<(GroupEvent | GroupSessionModel)[]>([]);
	const [onYourTimeContent, setOnYourTimeContent] = useState<Content[]>([]);

	const accountId = account?.accountId;
	const fetchData = useCallback(async () => {
		if (!accountId) return;

		const response = await recommendationsService.getRecommendations(accountId).fetch();

		setInTheStudioEvents([...response.groupSessions, ...response.groupEvents]);
		setOnYourTimeContent(response.contents);
	}, [accountId]);

	function handleConnectWithSupportButtonClick() {
		history.push('/connect-with-support');
	}

	function handleMoreOnYourTimeButtonClick() {
		history.push('/on-your-time');
	}

	if (subdomain === 'pic' && account) {
		const redirectTo = isPicMhicAccount(account) ? '/pic/mhic' : '/pic/home';
		return <Redirect to={redirectTo} />;
	}

	return (
		<AsyncPage fetchData={fetchData}>
			{institution?.supportEnabled && (
				<HeroContainer className="text-center">
					<h3 className="text-white mb-3">recommended for you</h3>
					<Button variant="light" className="mb-3" onClick={handleConnectWithSupportButtonClick}>
						<CalendarIcon className={classes.calendarIcon} />
						connect with support
					</Button>
					<small className="text-white text-uppercase">peers, resilience coaches, therapists, psychiatrists, and more are here to help</small>
				</HeroContainer>
			)}

			{inTheStudioEvents.length > 0 && (
				<>
					<Container fluid className={classNames(classes.inTheStudioContainer, 'pt-5')}>
						<Container>
							<Row>
								<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
									<div className="d-flex justify-content-between align-items-center mb-2">
										<h3 className="mb-0">in the studio</h3>
										<p className="mb-0 text-primary">
											<Link to="/in-the-studio">explore all</Link>
										</p>
									</div>
								</Col>
							</Row>
						</Container>
					</Container>
					<Container fluid className={classes.inTheStudioContainer}>
						<Container fluid="md">
							<Row>
								<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
									<Carousel prevIcon={<ChevronLeft />} nextIcon={<ChevronRight />}>
										{inTheStudioEvents.map((inTheStudioEvent) => {
											if (groupSessionsService.isGroupSession(inTheStudioEvent)) {
												return (
													<Carousel.Item key={inTheStudioEvent.groupSessionId}>
														<Link
															className="text-decoration-none"
															to={`/in-the-studio/group-session-scheduled/${inTheStudioEvent.groupSessionId}`}
														>
															<StudioEvent groupEvent={inTheStudioEvent} />
														</Link>
													</Carousel.Item>
												);
											}

											return (
												<Carousel.Item key={inTheStudioEvent.groupEventId}>
													<Link className="text-decoration-none" to={`/in-the-studio/${inTheStudioEvent.groupEventId}`}>
														<StudioEvent groupEvent={inTheStudioEvent} />
													</Link>
												</Carousel.Item>
											);
										})}
									</Carousel>
								</Col>
							</Row>
						</Container>
					</Container>
				</>
			)}

			<Container className="pt-5 pb-8">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-4 text-center">on your time</h3>

						<div className="d-flex justify-content-center mb-4">
							<Button
								size="sm"
								variant="light"
								onClick={() => {
									history.push('/on-your-time', { personalize: true });
								}}
							>
								personalize recommendations
							</Button>
						</div>

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
						<div className="mt-3 text-center">
							<Button variant="light" onClick={handleMoreOnYourTimeButtonClick}>
								more on your time
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default Index;
