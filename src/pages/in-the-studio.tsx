import React, { FC, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { groupEventService, groupSessionsService } from '@/lib/services';
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

const InTheStudio: FC = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const groupEventUrlName = searchParams.get('class') ?? '';
	const groupEventSearchQuery = searchParams.get('q') ?? '';
	const [searchTerm, setSearchTerm] = useState(groupEventSearchQuery);
	const [debouncedSearchValue, setDebouncedSearchValue] = useDebouncedState(searchTerm);
	const [eventList, setEventList] = useState<StudioEventViewModel[]>([]);
	const [actionSheetIsOpen, setActionSheetIsOpen] = useState(false);
	const { subdomainInstitution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		subdomainInstitution?.groupSessionsScreeningFlowId
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
			if (groupEventUrlName) {
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
					urlName: groupEventUrlName,
					searchQuery: debouncedSearchValue,
				})
				.fetch(),
			groupSessionsService
				.getGroupSessionRequests({
					viewType: 'PATIENT',
					groupSessionRequestStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					urlName: groupEventUrlName,
					searchQuery: debouncedSearchValue,
				})
				.fetch(),
		]);

		setEventList([...groupByUrlName(groupSessionRequests), ...groupByUrlName(groupSessions)]);
	}, [groupEventUrlName, debouncedSearchValue]);

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
			<ActionSheet
				show={actionSheetIsOpen}
				onShow={() => {
					setActionSheetIsOpen(true);
				}}
				onHide={() => {
					setActionSheetIsOpen(false);
				}}
			>
				<Button
					variant="secondary"
					className="d-block w-100 mb-2"
					onClick={() => {
						navigate('/group-sessions/scheduled/create');
					}}
				>
					Offer Session at a Set Time
				</Button>
				<Button
					variant="primary"
					className="d-block w-100"
					onClick={() => {
						navigate('/group-sessions/by-request/create');
					}}
				>
					Make Session Available by Request
				</Button>
			</ActionSheet>

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
							eventList.map((groupEvent) => {
								if (groupEventService.isEventExternal(groupEvent)) {
									const link = groupEvent.isGrouped
										? `/in-the-studio?class=${encodeURIComponent(groupEvent.urlName)}`
										: `/in-the-studio/external/${groupEvent.externalGroupEventTypeId}`;

									return (
										<Col md={6} lg={4} key={groupEvent.externalGroupEventTypeId}>
											<Link className="mb-2 d-block text-decoration-none" to={link}>
												<StudioEvent groupEvent={groupEvent} />
											</Link>
										</Col>
									);
								}

								if (groupSessionsService.isGroupSession(groupEvent)) {
									const link = groupEvent.isGrouped
										? `/in-the-studio?class=${encodeURIComponent(groupEvent.urlName)}`
										: `/in-the-studio/group-session-scheduled/${groupEvent.groupSessionId}`;

									return (
										<Col md={6} lg={4} key={groupEvent.groupSessionId}>
											<Link className="mb-2 d-block text-decoration-none" to={link}>
												<StudioEvent groupEvent={groupEvent} />
											</Link>
										</Col>
									);
								}

								if (groupSessionsService.isGroupSessionByRequest(groupEvent)) {
									const link = groupEvent.isGrouped
										? `/in-the-studio?class=${encodeURIComponent(groupEvent.urlName)}`
										: `/in-the-studio/group-session-by-request/${groupEvent.groupSessionRequestId}`;

									return (
										<Col md={6} lg={4} key={groupEvent.groupSessionRequestId}>
											<Link className="mb-2 d-block text-decoration-none" to={link}>
												<StudioEvent groupEvent={groupEvent} />
											</Link>
										</Col>
									);
								}

								return (
									<Col md={6} lg={4} key={groupEvent.groupEventId}>
										<Link
											className="mb-2 d-block text-decoration-none"
											to={`/in-the-studio/${groupEvent.groupEventId}`}
										>
											<StudioEvent groupEvent={groupEvent} />
										</Link>
									</Col>
								);
							})
						) : (
							<>
								<p className="text-center mb-0">
									{searchTerm ? (
										'There are no matching results.'
									) : groupEventUrlName ? (
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
