import { cloneDeep } from 'lodash';
import React, { Suspense, useEffect, useState } from 'react';
import {
	Await,
	Link,
	LoaderFunctionArgs,
	defer,
	useNavigate,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router-dom';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { GROUP_SESSION_SORT_ORDER, GROUP_SESSION_STATUS_ID, GroupSessionModel } from '@/lib/models';
import {
	GetGroupSessionCountsResponseBody,
	GetGroupSessionsQueryParameters,
	GetGroupSessionsResponseBody,
	GroupSessionSchedulingSystemId,
	groupSessionsService,
} from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import {
	AdminAddGroupSessionModal,
	AdminGroupSessionFilterScheduling,
	AdminGroupSessionFilterStatus,
	AdminGroupSessionFilterVisibility,
	AdminGroupSessionSort,
	GroupSessionTableDropdown,
} from '@/components/admin';

interface AdminGroupSessionsLoaderData {
	groupSessionsPromise: Promise<[GetGroupSessionsResponseBody, GetGroupSessionCountsResponseBody]>;
}

export function useAdminGroupSessionsLoaderData() {
	return useRouteLoaderData('admin-group-sessions') as AdminGroupSessionsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = parseInt(url.searchParams.get('pageNumber') ?? '0', 10);
	const groupSessionStatusId = url.searchParams.get('groupSessionStatusId');
	const groupSessionSchedulingSystemId = url.searchParams.get('groupSessionSchedulingSystemId');
	const visibleFlag = url.searchParams.get('visibleFlag');
	const orderBy = url.searchParams.get('orderBy') ?? GROUP_SESSION_SORT_ORDER.DATE_ADDED_DESCENDING;
	const queryParams: GetGroupSessionsQueryParameters = {
		orderBy,
	};

	if (groupSessionStatusId) {
		queryParams.groupSessionStatusId = groupSessionStatusId;
	}

	if (groupSessionSchedulingSystemId) {
		queryParams.groupSessionSchedulingSystemId = groupSessionSchedulingSystemId;
	}

	if (visibleFlag) {
		queryParams.visibleFlag = visibleFlag;
	}

	const groupSessionsrequest = groupSessionsService.getGroupSessions({
		viewType: 'ADMINISTRATOR',
		pageNumber,
		pageSize: 15,
		...queryParams,
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

	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = searchParams.get('pageNumber') ?? '0';

	const [isLoading, setIsLoading] = useState(false);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const [groupSessionsTotalCount, setGroupSessionsTotalCount] = useState(0);
	const [groupSessionsTotalCountDescription, setGroupSessionsTotalCountDescription] = useState('0');

	const [showAddGroupSessionModal, setShowAddGroupSessionModal] = useState(false);

	useEffect(() => {
		if (!groupSessionsPromise) {
			return;
		}

		const loadGroupSessions = async () => {
			try {
				setIsLoading(true);
				const [groupSessionsResponse] = await groupSessionsPromise;

				setGroupSessions(groupSessionsResponse.groupSessions);
				setGroupSessionsTotalCount(groupSessionsResponse.totalCount);
				setGroupSessionsTotalCountDescription(groupSessionsResponse.totalCountDescription);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadGroupSessions();
	}, [groupSessionsPromise, handleError]);

	const handleStatusUpdate = async (
		groupSessionId: string,
		actionId: GROUP_SESSION_STATUS_ID.ADDED | GROUP_SESSION_STATUS_ID.CANCELED | GROUP_SESSION_STATUS_ID.DELETED
	) => {
		if (actionId === GROUP_SESSION_STATUS_ID.CANCELED) {
			if (!window.confirm('Are you sure you want to cancel this group session?')) {
				return;
			}
		}

		if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
			if (!window.confirm('Are you sure you want to delete this group session?')) {
				return;
			}
		}

		const groupSessionsClone = cloneDeep(groupSessions);
		const replacementIndex = groupSessionsClone.findIndex((gs) => gs.groupSessionId === groupSessionId);

		setIsLoading(true);

		try {
			const { groupSession } = await groupSessionsService
				.updateGroupSessionStatusById(groupSessionId, actionId)
				.fetch();

			if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
				groupSessionsClone.splice(replacementIndex, 1);
			} else {
				groupSessionsClone.splice(replacementIndex, 1, groupSession);
			}

			setGroupSessions(groupSessionsClone);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePaginationClick = (pageIndex: number) => {
		searchParams.set('pageNumber', String(pageIndex));
		setSearchParams(searchParams);
	};

	return (
		<>
			<AdminAddGroupSessionModal
				show={showAddGroupSessionModal}
				onHide={() => {
					setShowAddGroupSessionModal(false);
				}}
				onContinue={(schedulingSystemId) => {
					if (schedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL) {
						navigate('/admin/group-sessions/add-external');
					} else if (schedulingSystemId === GroupSessionSchedulingSystemId.COBALT) {
						navigate('/admin/group-sessions/add-internal');
					} else {
						throw new Error(`Invalid scheduling system ID: ${schedulingSystemId}`);
					}
				}}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Group Sessions</h2>
							<Button
								onClick={() => {
									setShowAddGroupSessionModal(true);
								}}
							>
								Add Group Session
							</Button>
						</div>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6">
					<Col>
						<div className="d-flex align-items-center">
							<AdminGroupSessionFilterStatus />
							<AdminGroupSessionFilterScheduling className="mx-2" />
							<AdminGroupSessionFilterVisibility />
						</div>
					</Col>
					<Col>
						<div className="d-flex">
							<AdminGroupSessionSort className="ms-auto" />
						</div>
					</Col>
				</Row>
				<Suspense>
					<Await resolve={groupSessionsPromise}>
						<Row className="mb-8">
							<Col>
								<Table isLoading={isLoading}>
									<TableHead>
										<TableRow>
											<TableCell header>Session Date and Time</TableCell>
											<TableCell header>Session</TableCell>
											<TableCell header>Facilitator</TableCell>
											<TableCell header>Scheduling</TableCell>
											<TableCell header>Registrations</TableCell>
											<TableCell header>Capacity</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header>Visible</TableCell>
											<TableCell header colSpan={2}>
												Date Added
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{groupSessions.map((groupSession) => {
											const linkToEdit =
												groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW;
											return (
												<TableRow key={groupSession.groupSessionId}>
													<TableCell>{groupSession.startDateTimeDescription}</TableCell>
													<TableCell>
														<Link
															className="text-decoration-none"
															to={`/admin/group-sessions/${
																linkToEdit ? 'edit' : 'view'
															}/${groupSession.groupSessionId}`}
														>
															{groupSession.title}
														</Link>
													</TableCell>
													<TableCell>
														<span className="d-block">{groupSession.facilitatorName}</span>
														<span className="d-block text-muted">
															{groupSession.facilitatorEmailAddress}
														</span>
													</TableCell>
													<TableCell>
														{groupSession.groupSessionSchedulingSystemId ===
														GroupSessionSchedulingSystemId.COBALT
															? 'Cobalt'
															: 'External'}
													</TableCell>
													<TableCell>
														{groupSession.seatsReserved > 0 ? (
															<Link
																className="text-decoration-none"
																to={{
																	pathname: `/admin/group-sessions/view/${groupSession.groupSessionId}`,
																	search: '?tab=registrants',
																}}
															>
																{groupSession.seatsReserved}
															</Link>
														) : (
															groupSession.seatsReserved ?? 'N/A'
														)}
													</TableCell>
													<TableCell>{groupSession.seats ?? 'N/A'}</TableCell>
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
														{groupSession.groupSessionStatusId ===
															GROUP_SESSION_STATUS_ID.NEW && (
															<Badge pill bg="outline-warning" className="text-nowrap">
																{groupSession.groupSessionStatusIdDescription}
															</Badge>
														)}
													</TableCell>
													<TableCell>
														{groupSession.visibleFlag ? (
															<span className="text-success">Yes</span>
														) : (
															<span className="text-danger">No</span>
														)}
													</TableCell>
													<TableCell>{groupSession.createdDateDescription}</TableCell>
													<TableCell>
														<GroupSessionTableDropdown
															groupSession={groupSession}
															onCancel={(groupSessionId) => {
																handleStatusUpdate(
																	groupSessionId,
																	GROUP_SESSION_STATUS_ID.CANCELED
																);
															}}
															onDelete={(groupSessionId) => {
																handleStatusUpdate(
																	groupSessionId,
																	GROUP_SESSION_STATUS_ID.DELETED
																);
															}}
														/>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Col>
						</Row>
						<Row>
							<Col xs={{ span: 4, offset: 4 }}>
								<div className="d-flex justify-content-center align-items-center">
									<TablePagination
										total={groupSessionsTotalCount}
										page={parseInt(pageNumber, 10)}
										size={15}
										onClick={handlePaginationClick}
									/>
								</div>
							</Col>
							<Col xs={4}>
								<div className="d-flex justify-content-end align-items-center">
									<p className="mb-0 fw-semibold text-gray">
										<span className="text-dark">{groupSessions.length}</span> of{' '}
										<span className="text-dark">{groupSessionsTotalCountDescription}</span> Group
										Sessions
									</p>
								</div>
							</Col>
						</Row>
					</Await>
				</Suspense>
			</Container>
		</>
	);
};
