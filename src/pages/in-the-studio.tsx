import React, { FC, useState, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Fuse from 'fuse.js';

import useHeaderTitle from '@/hooks/use-header-title';

import AsyncPage from '@/components/async-page';
import StudioEvent, { StudioEventViewModel } from '@/components/studio-event';
import ActionSheet from '@/components/action-sheet';

import { groupEventService, groupSessionsService } from '@/lib/services';
import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER } from '@/lib/models';
import useQuery from '@/hooks/use-query';

const InTheStudio: FC = () => {
	useHeaderTitle('In the Studio');
	const query = useQuery();
	const history = useHistory();
	const groupEventUrlName = query.get('class') || '';

	const [eventList, setEventList] = useState<StudioEventViewModel[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

	const fuse = new Fuse(eventList, { threshold: 0.2, keys: ['name', 'provider.name'] });
	const filteredList = searchTerm ? fuse.search(searchTerm).map((r) => r.item) : eventList;

	const [actionSheetIsOpen, setActionSheetIsOpen] = useState(false);

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

		const [{ externalGroupEventTypes }, { groupEvents }, { groupSessions }, { groupSessionRequests }] = await Promise.all([
			groupEventService.fetchExternalGroupEventTypes({ urlName: groupEventUrlName }).fetch(),
			groupEventService.fetchGroupEvents({ urlName: groupEventUrlName }).fetch(),
			groupSessionsService
				.getGroupSessions({
					viewType: 'PATIENT',
					groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
					urlName: groupEventUrlName,
				})
				.fetch(),
			groupSessionsService
				.getGroupSessionRequests({
					viewType: 'PATIENT',
					groupSessionRequestStatusId: GROUP_SESSION_STATUS_ID.ADDED,
					urlName: groupEventUrlName,
				})
				.fetch(),
		]);

		setEventList([...groupByUrlName(externalGroupEventTypes), ...groupEvents, ...groupByUrlName(groupSessionRequests), ...groupByUrlName(groupSessions)]);
	}, [groupEventUrlName]);

	return (
		<AsyncPage fetchData={fetchData}>
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
						history.push('/group-sessions/scheduled/create');
					}}
				>
					offer session at a set time
				</Button>
				<Button
					variant="primary"
					className="d-block w-100"
					onClick={() => {
						history.push('/group-sessions/by-request/create');
					}}
				>
					make session available by request
				</Button>
			</ActionSheet>

			<Container className="pt-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form.Control
							type="search"
							placeholder="Find a Studio Session"
							className="mb-5"
							value={searchTerm}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setSearchTerm(event.target.value);
							}}
						/>
					</Col>
				</Row>
			</Container>
			<Container fluid="md">
				<Row>
					{filteredList.length > 0 ? (
						filteredList.map((groupEvent) => {
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
									<Link className="mb-2 d-block text-decoration-none" to={`/in-the-studio/${groupEvent.groupEventId}`}>
										<StudioEvent groupEvent={groupEvent} />
									</Link>
								</Col>
							);
						})
					) : (
						<p className="text-center mb-0">{searchTerm ? 'There are no matching results.' : 'There are no classes available.'}</p>
					)}
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudio;
