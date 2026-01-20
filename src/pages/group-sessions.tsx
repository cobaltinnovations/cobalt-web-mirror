import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';

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
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import StudioEvent, { StudioEventSkeleton } from '@/components/studio-event';
import Carousel, { responsiveDefaults } from '@/components/carousel';
import NoData from '@/components/no-data';
import GroupSessionsRequestFooter from '@/components/group-sessions-request-footer';
import classNames from 'classnames';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';

const GroupSessions = () => {
	const handleError = useHandleError();

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
	const { renderedPreScreeningLoader, didCheckScreeningSessions } = useScreeningFlow({
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
			setGroupSessionCollections(groupSessionCollections.filter((c) => c.groupSessions.length > 0));
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

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Group Sessions</title>
			</Helmet>

			<IneligibleBookingModal uiType="group-session" />

			<HeroContainer className="bg-n75">
				<h1 className="mb-6 text-center">Group Sessions</h1>
				<p className="mb-6 fs-large text-center">
					{institution.features.find((f) => f.featureId === 'GROUP_SESSIONS')?.description}
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
														to={`/group-sessions/${groupSession.urlName}`}
														state={{
															navigationSource:
																GroupSessionDetailNavigationSource.GROUP_SESSION_LIST,
														}}
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
													key={collection.groupSessionCollectionId}
													className={classNames({
														'mb-8 mb-lg-12': !isLastCollection,
													})}
												>
													<Col>
														<div className="d-flex align-items-center justify-content-between">
															<h3 className="mb-0">{collection.title}</h3>
															<Link
																to={`/group-sessions/collection/${collection.urlName}`}
															>
																See all
															</Link>
														</div>
														<Carousel
															className={classNames({
																'mb-8 mb-lg-12': !isLastCollection,
															})}
															responsive={responsiveDefaults}
														>
															{collection.groupSessions.map((groupSession) => {
																return (
																	<Link
																		key={groupSession.groupSessionId}
																		className="d-block text-decoration-none h-100"
																		to={`/group-sessions/${groupSession.urlName}`}
																		state={{
																			navigationSource:
																				GroupSessionDetailNavigationSource.GROUP_SESSION_LIST,
																		}}
																	>
																		<StudioEvent
																			className="h-100"
																			studioEvent={groupSession}
																		/>
																	</Link>
																);
															})}
														</Carousel>
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
			</Container>

			<GroupSessionsRequestFooter />
		</>
	);
};

export default GroupSessions;
