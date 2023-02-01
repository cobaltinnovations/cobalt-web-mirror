import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { groupSessionsService } from '@/lib/services';
import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER, GroupSessionModel } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import Loader from '@/components/loader';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import StudioEvent, { StudioEventSkeleton } from '@/components/studio-event';
import useHandleError from '@/hooks/use-handle-error';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	requestSessionCta: {
		maxWidth: 382,
		margin: '0 auto',
	},
});

const GroupSessions = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { mixpanel } = useAnalytics();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();
	const groupSessionUrlName = searchParams.get('class') ?? '';
	const groupSessionSearchQuery = searchParams.get('searchQuery') ?? '';
	const pageSize = useRef(6);
	const pageNumber = useRef(0);

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState(groupSessionSearchQuery);

	const [isLoading, setIsLoading] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const [groupSessionsTotalCount, setGroupSessionsTotalCount] = useState(0);
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		institution?.groupSessionsScreeningFlowId
	);

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

			const { groupSessions, totalCount } = await groupSessionsService
				.getGroupSessions({
					viewType: 'PATIENT',
					groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
					urlName: groupSessionUrlName,
					searchQuery: groupSessionSearchQuery,
					pageSize: pageSize.current,
					pageNumber: pageNumber.current,
				})
				.fetch();

			setGroupSessions((previousValue) => previousValue.concat(groupSessions));
			setGroupSessionsTotalCount(totalCount);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
			setIsFirstLoad(false);
		}
	}, [groupSessionSearchQuery, groupSessionUrlName, handleError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const disableViewMore = groupSessionsTotalCount <= pageNumber.current + 1 * pageSize.current;
	const handleViewMoreButtonClick = useCallback(() => {
		if (disableViewMore) {
			return;
		}

		pageNumber.current++;
		fetchData();
	}, [disableViewMore, fetchData]);

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
				<Row className="mb-10">
					<Col>
						<h2>Upcoming Sessions</h2>
					</Col>
				</Row>
				{!isLoading && groupSessions.length <= 0 && (
					<Row className="mb-2">
						<Col>
							<p className="text-center mb-0">
								{groupSessionSearchQuery ? (
									'There are no matching results.'
								) : groupSessionUrlName ? (
									<>
										There are no group sessions available for the selected type.
										<Button
											size="sm"
											variant="link"
											onClick={() => {
												searchParams.delete('class');
												setSearchParams(searchParams, { replace: true });
											}}
										>
											Click here to view all available group sessions.
										</Button>
									</>
								) : (
									'There are no group sessions available.'
								)}
							</p>
						</Col>
					</Row>
				)}
				{groupSessions.length > 0 && (
					<Row className="mb-2">
						{groupSessions.map((groupSession) => {
							return (
								<Col md={6} lg={4} key={groupSession.groupSessionId} className="mb-8">
									<Link
										className="d-block text-decoration-none h-100"
										to={`/in-the-studio/group-session-scheduled/${groupSession.groupSessionId}`}
									>
										<StudioEvent className="h-100" studioEvent={groupSession} />
									</Link>
								</Col>
							);
						})}
					</Row>
				)}
				{isLoading && (
					<Row className="mb-10">
						{isFirstLoad ? (
							<>
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
							</>
						) : (
							<Col>
								<Loader className="position-relative" />
							</Col>
						)}
					</Row>
				)}
				<Row>
					<Col></Col>
					<Col>
						{!disableViewMore && (
							<div className="text-center">
								<Button onClick={handleViewMoreButtonClick} disabled={isLoading}>
									View More
								</Button>
							</div>
						)}
					</Col>
					<Col>
						<div className="text-right">
							{institution?.userSubmittedGroupSessionEnabled && (
								<Button
									variant="link"
									onClick={() => {
										mixpanel.track('Patient-Sourced Add Group Session Click', {});
										navigate('/group-sessions/scheduled/create');
									}}
								>
									Submit a Session
								</Button>
							)}
							{/* {institution?.userSubmittedGroupSessionRequestEnabled && (
									<Button
										variant="link"
										onClick={() => {
											mixpanel.track('Patient-Sourced Add Group Session Request Click', {});
											navigate('/group-sessions/by-request/create');
										}}
									>
										Submit a Session
									</Button>
								)} */}
						</div>
					</Col>
				</Row>
			</Container>
			{institution?.groupSessionRequestsEnabled && (
				<Container fluid className="bg-n75">
					<Container className="py-10 py-lg-20">
						<div className={classes.requestSessionCta}>
							<h2 className="mb-6 text-center">Looking to schedule a group session for your team?</h2>
							<p className="mb-6 fs-large text-center">
								Request a session and we'll work with you to find a dedicated time for a
								wellness-focused group session for your team.
							</p>
							<div className="text-center">
								<Button
									variant="outline-primary"
									onClick={() => {
										navigate('/group-sessions/request');
									}}
								>
									Request a Session
								</Button>
							</div>
						</div>
					</Container>
				</Container>
			)}
		</>
	);
};

export default GroupSessions;
