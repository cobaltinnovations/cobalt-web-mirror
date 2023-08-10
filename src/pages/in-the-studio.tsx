import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { groupSessionsService } from '@/lib/services';
import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import AsyncPage from '@/components/async-page';
import Loader from '@/components/loader';
import ActionSheet from '@/components/action-sheet';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import StudioEvent, { StudioEventSkeleton, StudioEventViewModel } from '@/components/studio-event';

const InTheStudio: FC = () => {
	const { mixpanel } = useAnalytics();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();
	const groupSessionUrlName = searchParams.get('class') ?? '';
	const groupSessionSearchQuery = searchParams.get('searchQuery') ?? '';

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState(groupSessionSearchQuery);

	const [groupSessions, setGroupSessions] = useState<StudioEventViewModel[]>([]);
	const [actionSheetIsOpen, setActionSheetIsOpen] = useState(false);
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow({
		screeningFlowId: institution?.groupSessionsScreeningFlowId,
	});

	useEffect(() => {
		if (!didCheckScreeningSessions) {
			return;
		}

		if (!hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [didCheckScreeningSessions, hasTouchScreen]);

	const fetchData = useCallback(async () => {
		const [{ groupSessions }, { groupSessionRequests }] = await Promise.all([
			groupSessionsService
				.getGroupSessions({
					viewType: 'PATIENT',
					groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
					urlName: groupSessionUrlName,
					searchQuery: groupSessionSearchQuery,
				})
				.fetch(),
			groupSessionsService
				.getGroupSessionRequests({
					viewType: 'PATIENT',
					groupSessionRequestStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					urlName: groupSessionUrlName,
					searchQuery: groupSessionSearchQuery,
				})
				.fetch(),
		]);

		setGroupSessions([...groupSessionRequests, ...groupSessions]);
	}, [groupSessionUrlName, groupSessionSearchQuery]);

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
			searchInputRef.current?.focus({ preventScroll: true });
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

	const actionSheetEnabled =
		institution?.userSubmittedGroupSessionEnabled || institution?.userSubmittedGroupSessionRequestEnabled;

	return (
		<>
			<Helmet>
				<title>Cobalt | In the Studio</title>
			</Helmet>

			{actionSheetEnabled && (
				<ActionSheet
					show={actionSheetIsOpen}
					onShow={() => {
						setActionSheetIsOpen(true);
					}}
					onHide={() => {
						setActionSheetIsOpen(false);
					}}
				>
					{/* {institution?.userSubmittedGroupSessionEnabled && (
						<Button
							variant="secondary"
							className="d-block w-100 mb-2"
							onClick={() => {
								mixpanel.track('Patient-Sourced Add Group Session Click', {});
								navigate('/group-sessions/scheduled/create');
							}}
						>
							Offer Session at a Set Time
						</Button>
					)} */}
					{/* {institution?.userSubmittedGroupSessionRequestEnabled && (
						<Button
							variant="primary"
							className="d-block w-100"
							onClick={() => {
								mixpanel.track('Patient-Sourced Add Group Session Request Click', {});
								navigate('/group-sessions/by-request/create');
							}}
						>
							Make Session Available by Request
						</Button>
					)} */}
				</ActionSheet>
			)}

			<HeroContainer className="mb-8 bg-n75">
				<h1 className="mb-6 text-center">Group Sessions</h1>
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

			<AsyncPage
				fetchData={fetchData}
				loadingComponent={
					<Container>
						<Row>
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
					</Container>
				}
			>
				<Container>
					<Row>
						{groupSessions.length > 0 ? (
							groupSessions.map((groupSession) => {
								let renderKey = '';
								let detailUrl = '';

								if (groupSessionsService.isGroupSession(groupSession)) {
									renderKey = groupSession.groupSessionId;
									detailUrl = `/in-the-studio/group-session-scheduled/${groupSession.groupSessionId}`;
								} else if (groupSessionsService.isGroupSessionByRequest(groupSession)) {
									renderKey = groupSession.groupSessionRequestId;
									detailUrl = `/in-the-studio/group-session-by-request/${groupSession.groupSessionRequestId}`;
								} else {
									console.warn('attempting to render an unknown studio event');
									return null;
								}

								return (
									<Col md={6} lg={4} key={renderKey} className="mb-8">
										<Link className="d-block text-decoration-none h-100" to={detailUrl}>
											<StudioEvent className="h-100" studioEvent={groupSession} />
										</Link>
									</Col>
								);
							})
						) : (
							<>
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
							</>
						)}
					</Row>
				</Container>
			</AsyncPage>
		</>
	);
};

export default InTheStudio;
