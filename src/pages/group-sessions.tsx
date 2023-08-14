import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import {
	GROUP_SESSION_STATUS_ID,
	GROUP_SESSION_SORT_ORDER,
	GroupSessionModel,
	GroupSessionCollectionWithSessionsIncludedModel,
} from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import Loader from '@/components/loader';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import StudioEvent, { StudioEventSkeleton } from '@/components/studio-event';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import NoData from '@/components/no-data';

const GroupSessions = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();
	const groupSessionUrlName = searchParams.get('class') ?? '';
	const groupSessionSearchQuery = searchParams.get('searchQuery') ?? '';

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState(groupSessionSearchQuery);

	const [isLoading, setIsLoading] = useState(false);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const [groupSessionCollections, setGroupSessionCollections] = useState<
		GroupSessionCollectionWithSessionsIncludedModel[]
	>([]);
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow({
		screeningFlowId: institution?.groupSessionsScreeningFlowId,
	});

	useEffect(() => {
		if (!didCheckScreeningSessions) {
			return;
		}

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [didCheckScreeningSessions, hasTouchScreen]);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			if (groupSessionSearchQuery) {
				const { groupSessions } = await groupSessionsService
					.getGroupSessions({
						viewType: 'PATIENT',
						groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
						orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
						urlName: groupSessionUrlName,
						searchQuery: groupSessionSearchQuery,
						pageSize: 1000,
						pageNumber: 0,
					})
					.fetch();

				setGroupSessions(groupSessions);
				setGroupSessionCollections([]);
				return;
			}

			const [{ groupSessions }, { groupSessionCollections }] = await Promise.all([
				groupSessionsService
					.getGroupSessions({
						viewType: 'PATIENT',
						groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
						orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
						urlName: groupSessionUrlName,
						pageSize: 12,
						pageNumber: 0,
					})
					.fetch(),
				groupSessionsService.getGroupSessionCollectionsWithSessionsIncluded().fetch(),
			]);

			setGroupSessions([]);
			setGroupSessionCollections([
				...[
					{
						groupSessionCollectionId: 'UPCOMING_SESSIONS',
						description: 'Upcoming Sessions',
						displayOrder: 0,
						institutionId: '',
						groupSessions,
					},
				],
				...groupSessionCollections,
			]);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [groupSessionSearchQuery, groupSessionUrlName, handleError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (searchInputValue) {
			searchParams.set('searchQuery', searchInputValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		searchParams.delete('searchQuery');

		setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [hasTouchScreen, searchParams, setSearchParams]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	if (!didCheckScreeningSessions) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Sessions</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-6 text-center">Group Sessions</h1>
				<p className="mb-6 fs-large text-center">
					Virtual sessions led by experts and designed to foster connection and provide support for people
					experiencing similar issues or concerns. Topics range from managing anxiety to healthy living and
					mindfulness.
				</p>
				<Form onSubmit={handleSearchFormSubmit}>
					<InputHelperSearch
						ref={searchInputRef}
						placeholder="Find a Group Session"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
						onClear={clearSearch}
					/>
				</Form>
			</HeroContainer>

			<Container className="py-10">
				{!isLoading && (
					<>
						{groupSessionSearchQuery ? (
							<>
								{/* ---------------------------------- */}
								{/* SEARCH RESULTS GRID */}
								{/* ---------------------------------- */}
								{groupSessions.length > 0 ? (
									<Row className="mb-2">
										{groupSessions.map((groupSession) => {
											return (
												<Col md={6} lg={4} key={groupSession.groupSessionId} className="mb-8">
													<Link
														className="d-block text-decoration-none h-100"
														to={`/group-sessions/${groupSession.groupSessionId}`}
													>
														<StudioEvent className="h-100" studioEvent={groupSession} />
													</Link>
												</Col>
											);
										})}
									</Row>
								) : (
									<Row>
										<Col>
											<NoData
												title="No Search Results"
												description={`There are no matching group sessions for "${groupSessionSearchQuery}"`}
												actions={[
													{
														variant: 'primary',
														title: 'Clear Search',
														onClick: clearSearch,
													},
												]}
											/>
										</Col>
									</Row>
								)}
							</>
						) : (
							<>
								{/* ---------------------------------- */}
								{/* LIST OF CAROUSELS */}
								{/* ---------------------------------- */}
								{groupSessionCollections.length > 0 ? (
									<>
										{groupSessionCollections.map((collection, collectionIndex) => {
											const isLastCollection =
												collectionIndex === groupSessionCollections.length - 1;

											return (
												<Row
													className="mb-12 mb-lg-16"
													key={collection.groupSessionCollectionId}
												>
													<Col>
														{collection.groupSessions.length > 0 ? (
															<Carousel
																className="mb-8 mb-lg-12"
																responsive={responsiveDefaults}
																description={collection.description}
																calloutTitle="See All"
																calloutOnClick={() => {
																	navigate(
																		`/group-sessions/collection/${collection.groupSessionCollectionId}`
																	);
																}}
															>
																{collection.groupSessions.map((groupSession) => {
																	return (
																		<Link
																			key={groupSession.groupSessionId}
																			className="d-block text-decoration-none h-100"
																			to={`/group-sessions/${groupSession.groupSessionId}`}
																		>
																			<StudioEvent
																				className="h-100"
																				studioEvent={groupSession}
																			/>
																		</Link>
																	);
																})}
															</Carousel>
														) : (
															<>
																<h3 className="mb-4">{collection.description}</h3>
																<NoData
																	className="mb-12 mb-lg-16"
																	title={collection.description}
																	description="There are no group sessions for this collection."
																	actions={[
																		...(groupSessionUrlName
																			? [
																					{
																						variant: 'primary',
																						title: 'Click here to view all available group sessions',
																						onClick: () => {
																							searchParams.delete(
																								'class'
																							);
																							setSearchParams(
																								searchParams,
																								{
																									replace: true,
																								}
																							);
																						},
																					},
																			  ]
																			: []),
																	]}
																/>
															</>
														)}
														{!isLastCollection && <hr />}
													</Col>
												</Row>
											);
										})}
									</>
								) : (
									<NoData
										title="Upcoming Sessions"
										description="There are no group sessions available."
										actions={[]}
									/>
								)}
							</>
						)}
					</>
				)}

				{isLoading && (
					<Row className="mb-10">
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
						<Col md={6} lg={4} className="mb-8">
							<StudioEventSkeleton />
						</Col>
					</Row>
				)}
			</Container>

			{institution?.groupSessionRequestsEnabled && (
				<Container fluid className="bg-n75">
					<Container className="py-10 py-lg-20">
						<Row>
							<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
								<h2 className="mb-6 text-center">Looking for a different type of group session?</h2>
								<p className="mb-6 fs-large text-center">
									Request a session to find a dedicated time for a wellness-focused group session for
									your team. You can also suggest a session to let us know about any topics that are
									not currently avaialble.
								</p>
								<div className="text-center">
									<Button
										variant="primary"
										className="me-1"
										onClick={() => {
											navigate('/group-sessions/request');
										}}
									>
										Request a Session
									</Button>
									<Button
										variant="outline-primary"
										className="ms-1"
										onClick={() => {
											window.alert('[TODO]: Suggest Modal');
										}}
									>
										Suggest a Session
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}
		</>
	);
};

export default GroupSessions;
