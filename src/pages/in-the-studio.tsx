import React, { FC, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { groupSessionsService } from '@/lib/services';
import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER } from '@/lib/models';
import useDebouncedState from '@/hooks/use-debounced-state';

import AsyncPage from '@/components/async-page';
import StudioEvent, { StudioEventViewModel } from '@/components/studio-event';
import ActionSheet from '@/components/action-sheet';
import InputHelper from '@/components/input-helper';
import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from './screening/screening.hooks';
import Loader from '@/components/loader';
import useAnalytics from '@/hooks/use-analytics';

const InTheStudio: FC = () => {
	const { mixpanel } = useAnalytics();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const groupSessionUrlName = searchParams.get('class') ?? '';
	const groupSessionSearchQuery = searchParams.get('q') ?? '';
	const [searchTerm, setSearchTerm] = useState(groupSessionSearchQuery);
	const [debouncedSearchValue, setDebouncedSearchValue] = useDebouncedState(searchTerm);
	const [eventList, setEventList] = useState<StudioEventViewModel[]>([]);
	const [actionSheetIsOpen, setActionSheetIsOpen] = useState(false);
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		institution?.groupSessionsScreeningFlowId
	);

	useEffect(() => {
		if (!didCheckScreeningSessions) {
			return;
		}

		if (debouncedSearchValue) {
			searchParams.set('q', debouncedSearchValue);
		} else {
			searchParams.delete('q');
		}

		setSearchParams(searchParams, { replace: true });
	}, [debouncedSearchValue, didCheckScreeningSessions, searchParams, setSearchParams]);

	const fetchData = useCallback(async () => {
		function groupByUrlName(data: StudioEventViewModel[]): StudioEventViewModel[] {
			if (groupSessionUrlName) {
				return data;
			}

			const addedUrlNames: Record<string, boolean> = {};

			return data.reduce((acc, i) => {
				if (i.urlName) {
					if (!addedUrlNames[i.urlName]) {
						addedUrlNames[i.urlName] = true;

						const count = data.filter((ii) => ii.urlName === i.urlName).length;

						if (count > 1) {
							i.isGrouped = true;
						}

						acc.push(i);
					}
				}

				return acc;
			}, [] as typeof data);
		}

		const [{ groupSessions }, { groupSessionRequests }] = await Promise.all([
			groupSessionsService
				.getGroupSessions({
					viewType: 'PATIENT',
					groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
					urlName: groupSessionUrlName,
					searchQuery: debouncedSearchValue,
				})
				.fetch(),
			groupSessionsService
				.getGroupSessionRequests({
					viewType: 'PATIENT',
					groupSessionRequestStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					urlName: groupSessionUrlName,
					searchQuery: debouncedSearchValue,
				})
				.fetch(),
		]);

		setEventList([...groupByUrlName(groupSessionRequests), ...groupByUrlName(groupSessions)]);
	}, [groupSessionUrlName, debouncedSearchValue]);

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
					{institution?.userSubmittedGroupSessionEnabled && (
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
					)}
					{institution?.userSubmittedGroupSessionRequestEnabled && (
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
					)}
				</ActionSheet>
			)}

			<HeroContainer>
				<h2 className="mb-0 text-center">Group Sessions</h2>
			</HeroContainer>

			<Container className="pt-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<InputHelper
							type="search"
							label="Find a Group Session"
							className="mb-5"
							value={searchTerm}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								const value = event.currentTarget.value;
								// immediately clear
								if (!value) {
									setDebouncedSearchValue('');
								}

								setSearchTerm(value);
							}}
						/>
					</Col>
				</Row>
			</Container>
			<AsyncPage fetchData={fetchData}>
				<Container>
					<Row>
						{eventList.length > 0 ? (
							eventList.map((studioEvent) => {
								if (groupSessionsService.isGroupSession(studioEvent)) {
									const link = studioEvent.isGrouped
										? `/in-the-studio?class=${encodeURIComponent(studioEvent.urlName)}`
										: `/in-the-studio/group-session-scheduled/${studioEvent.groupSessionId}`;

									return (
										<Col md={6} lg={4} key={studioEvent.groupSessionId} className="mb-8">
											<Link className="d-block text-decoration-none h-100" to={link}>
												<StudioEvent className="h-100" studioEvent={studioEvent} />
											</Link>
										</Col>
									);
								} else if (groupSessionsService.isGroupSessionByRequest(studioEvent)) {
									const link = studioEvent.isGrouped
										? `/in-the-studio?class=${encodeURIComponent(studioEvent.urlName)}`
										: `/in-the-studio/group-session-by-request/${studioEvent.groupSessionRequestId}`;

									return (
										<Col md={6} lg={4} key={studioEvent.groupSessionRequestId} className="mb-8">
											<Link className="d-block text-decoration-none h-100" to={link}>
												<StudioEvent className="h-100" studioEvent={studioEvent} />
											</Link>
										</Col>
									);
								} else {
									console.warn('attempting to render an unknown studio event');
									return null;
								}
							})
						) : (
							<>
								<p className="text-center mb-0">
									{searchTerm ? (
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
