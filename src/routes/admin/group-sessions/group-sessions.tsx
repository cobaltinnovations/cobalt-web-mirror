import React, { Suspense, useEffect, useState } from 'react';
import { Await, LoaderFunctionArgs, defer, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';

import { GROUP_SESSION_STATUS_ID, GroupSessionModel } from '@/lib/models';
import { GetGroupSessionCountsResponseBody, GetGroupSessionsResponseBody, groupSessionsService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';

interface AdminGroupSessionsLoaderData {
	groupSessionsPromise: Promise<[GetGroupSessionsResponseBody, GetGroupSessionCountsResponseBody]>;
}

export function useAdminGroupSessionsLoaderData() {
	return useRouteLoaderData('admin-group-sessions') as AdminGroupSessionsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = parseInt(url.searchParams.get('pageNumber') ?? '0', 10);

	const groupSessionsrequest = groupSessionsService.getGroupSessions({
		viewType: 'ADMINISTRATOR',
		pageNumber,
		pageSize: 15,
		// ...(statusFilterValue ? { groupSessionStatusId: statusFilterValue } : {}),
	});
	const groupSessionCountsRequest = groupSessionsService.getGroupSessionCounts();
	const groupSessionsPromise = Promise.all([groupSessionsrequest.fetch(), groupSessionCountsRequest.fetch()]);

	return defer({
		groupSessionsPromise,
	});
}

export const Component = () => {
	const { groupSessionsPromise } = useAdminGroupSessionsLoaderData();
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);

	useEffect(() => {
		if (!groupSessionsPromise) {
			return;
		}

		const loadGroupSessions = async () => {
			try {
				const [groupSessionsResponse, groupSessionCountResponse] = await groupSessionsPromise;

				setGroupSessions(groupSessionsResponse.groupSessions);

				console.log('groupSessionsResponse', groupSessionsResponse);
				console.log('groupSessionCountResponse', groupSessionCountResponse);
			} catch (error) {
				handleError(error);
			}
		};

		loadGroupSessions();
	}, [groupSessionsPromise, handleError]);

	return (
		<Container fluid className="px-8 py-8">
			<Row className="mb-6">
				<Col>
					<div className="mb-6 d-flex align-items-center justify-content-between">
						<h2 className="mb-0">Group Sessions</h2>
						<Button
							onClick={() => {
								navigate('/group-sessions/scheduled/create');
							}}
						>
							Add Group Session
						</Button>
					</div>
					<hr />
				</Col>
			</Row>

			<Row className="mb-6">
				<Col>filters</Col>
				<Col>sort</Col>
			</Row>

			<Suspense>
				<Await resolve={groupSessionsPromise}>
					<Row>
						<Col>
							<Table isLoading={false}>
								<TableHead>
									<TableRow>
										<TableCell header>Date Added</TableCell>
										<TableCell header>Session</TableCell>
										<TableCell header>Facilitator</TableCell>
										<TableCell header>Scheduling</TableCell>
										<TableCell header>Capacity</TableCell>
										<TableCell header>Status</TableCell>
										<TableCell header>Visible</TableCell>
										<TableCell header>Start Date</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{groupSessions.map((groupSession) => (
										<TableRow>
											<TableCell>{groupSession.createdDateDescription}</TableCell>
											<TableCell>{groupSession.title}</TableCell>
											<TableCell>
												<span className="d-block">{groupSession.facilitatorName}</span>
												<span className="d-block text-muted">
													{groupSession.facilitatorEmailAddress}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-danger">[TODO]: Internal/External</span>
											</TableCell>
											<TableCell>
												{groupSession.seatsReserved}/{groupSession.seats}
											</TableCell>
											<TableCell className="flex-row align-items-center justify-content-start">
												{groupSession.groupSessionStatusId ===
													GROUP_SESSION_STATUS_ID.ADDED && (
													<Badge pill bg="outline-success" className="text-nowrap">
														{groupSession.groupSessionStatusIdDescription}
													</Badge>
												)}
												{groupSession.groupSessionStatusId ===
													GROUP_SESSION_STATUS_ID.ARCHIVED && (
													<Badge pill bg="outline-light" className="text-nowrap">
														{groupSession.groupSessionStatusIdDescription}
													</Badge>
												)}
												{groupSession.groupSessionStatusId ===
													GROUP_SESSION_STATUS_ID.CANCELED && (
													<Badge pill bg="outline-danger" className="text-nowrap">
														{groupSession.groupSessionStatusIdDescription}
													</Badge>
												)}
												{groupSession.groupSessionStatusId ===
													GROUP_SESSION_STATUS_ID.DELETED && (
													<Badge pill bg="outline-danger" className="text-nowrap">
														{groupSession.groupSessionStatusIdDescription}
													</Badge>
												)}
												{groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW && (
													<Badge pill bg="outline-warning" className="text-nowrap">
														{groupSession.groupSessionStatusIdDescription}
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<span className="text-danger">[TODO]: Yes/No</span>
											</TableCell>
											<TableCell>{groupSession.startDateTimeDescription}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Col>
					</Row>
				</Await>
			</Suspense>
		</Container>
	);
};
