import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { analyticsService, GroupSessionSchedulingSystemId, groupSessionsService } from '@/lib/services';
import {
	GROUP_SESSION_STATUS_ID,
	GROUP_SESSION_SORT_ORDER,
	GroupSessionModel,
	AnalyticsNativeEventTypeId,
} from '@/lib/models';
import useAccount from '@/hooks/use-account';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import Loader from '@/components/loader';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import StudioEvent, { StudioEventSkeleton } from '@/components/studio-event';
import useHandleError from '@/hooks/use-handle-error';
import { Helmet } from 'react-helmet';
import GroupSessionsRequestFooter from '@/components/group-sessions-request-footer';
import NoData from '@/components/no-data';
import SelectGroupSessionTypeModal from '@/components/select-group-session-type-modal';
import SvgIcon from '@/components/svg-icon';

const GroupSessionsOg = () => {
	const handleError = useHandleError();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();
	const groupSessionUrlName = searchParams.get('class') ?? '';
	const groupSessionSearchQuery = searchParams.get('searchQuery') ?? '';

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState(groupSessionSearchQuery);

	const [isLoading, setIsLoading] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [showSelectGroupSessionTypeModal, setShowSelectGroupSessionTypeModal] = useState(false);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow({
		screeningFlowId: institution?.groupSessionsScreeningFlowId,
	});
	const [isViewingAll, setIsViewingAll] = useState(!!groupSessionUrlName);

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

			const { groupSessions } = await groupSessionsService
				.getGroupSessions({
					viewType: 'PATIENT',
					groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
					urlName: groupSessionUrlName,
					searchQuery: groupSessionSearchQuery,
					pageSize: isViewingAll ? 1000 : 9,
					pageNumber: 0,
				})
				.fetch();

			setGroupSessions(groupSessions);

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_GROUP_SESSIONS, {
				searchQuery:
					groupSessionSearchQuery && groupSessionSearchQuery.trim().length > 0
						? groupSessionSearchQuery.trim()
						: undefined,
			});
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
			setIsFirstLoad(false);
		}
	}, [groupSessionSearchQuery, groupSessionUrlName, handleError, isViewingAll]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleViewAllButtonClick = useCallback(() => {
		setIsViewingAll(true);
	}, []);

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
			<SelectGroupSessionTypeModal
				show={showSelectGroupSessionTypeModal}
				onHide={() => {
					setShowSelectGroupSessionTypeModal(false);
				}}
				onContinue={({ groupSessionSchedulingSystemId }) => {
					const destination = `/group-sessions/create/${
						groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL
							? 'add-external'
							: 'add-internal'
					}`;

					navigate(destination);
				}}
			/>

			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Group Sessions</title>
			</Helmet>

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
				<Row className="mb-10">
					<Col>
						<h2>Upcoming Sessions</h2>
					</Col>
				</Row>
				{!isLoading && groupSessions.length <= 0 && (
					<Row className="mb-6">
						<Col>
							<div className="text-center mb-0">
								{groupSessionSearchQuery ? (
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
								) : groupSessionUrlName ? (
									<NoData
										title="No Results"
										description="There are no group sessions available for the selected type."
										actions={[
											{
												variant: 'primary',
												title: 'Click here to view all available group sessions.',
												onClick: () => {
													searchParams.delete('class');
													setSearchParams(searchParams, { replace: true });
												},
											},
										]}
									/>
								) : (
									<NoData
										title="Upcoming Sessions"
										description="There are no group sessions available."
										actions={[]}
									/>
								)}
							</div>
						</Col>
					</Row>
				)}
				{groupSessions.length > 0 && (
					<Row className="mb-2">
						{groupSessions.map((groupSession) => {
							return (
								<Col md={6} lg={4} key={groupSession.urlName} className="mb-8">
									<Link
										className="d-block text-decoration-none h-100"
										to={`/group-sessions/${groupSession.urlName}`}
									>
										<StudioEvent className="h-100" studioEvent={groupSession} />
									</Link>
								</Col>
							);
						})}
					</Row>
				)}
				{isLoading && isFirstLoad && (
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
				<Row>
					{isLoading ? (
						<Col>
							<Loader className="position-static d-inline-flex" />
						</Col>
					) : (
						<>
							<Col xs={12} lg={4} />

							<Col xs={12} lg={4} className="text-center">
								{!isViewingAll && groupSessions.length >= 9 && (
									<Button onClick={handleViewAllButtonClick} disabled={isLoading}>
										View All
									</Button>
								)}
							</Col>

							{institution?.userSubmittedGroupSessionEnabled && (
								<Col xs={12} lg={4} className="text-center mt-4 mt-lg-0 text-lg-end">
									<Button
										variant="light"
										className=""
										onClick={() => {
											setShowSelectGroupSessionTypeModal(true);
										}}
									>
										<SvgIcon kit="fas" icon="plus" size={16} className="text-primary me-2" /> Submit
										a Session
									</Button>
								</Col>
							)}
						</>
					)}
				</Row>
			</Container>

			<GroupSessionsRequestFooter />
		</>
	);
};

export default GroupSessionsOg;
