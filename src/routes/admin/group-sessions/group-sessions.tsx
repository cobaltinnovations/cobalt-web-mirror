import { cloneDeep } from 'lodash';
import moment from 'moment';
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
import {
	CONTENT_VISIBILITY_TYPE_ID,
	GROUP_SESSION_SORT_ORDER,
	GROUP_SESSION_STATUS_ID,
	GroupSessionModel,
} from '@/lib/models';
import {
	GetGroupSessionCountsResponseBody,
	GetGroupSessionsQueryParameters,
	GetGroupSessionsResponseBody,
	GroupSessionSchedulingSystemId,
	groupSessionsService,
} from '@/lib/services';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import InputHelperSearch from '@/components/input-helper-search';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import {
	AdminGroupSessionFilterScheduling,
	AdminGroupSessionFilterStatus,
	AdminGroupSessionFilterVisibility,
	AdminGroupSessionSort,
	GroupSessionTableDropdown,
} from '@/components/admin';
import SelectGroupSessionTypeModal from '@/components/select-group-session-type-modal';
import SvgIcon from '@/components/svg-icon';

const GROUP_SESSION_TABLE_DATE_FORMAT = 'MMM DD, YYYY';
const GROUP_SESSION_TABLE_DATE_INPUT_FORMATS = [
	'MM/DD/YY',
	'M/D/YY',
	'MM/DD/YYYY',
	'M/D/YYYY',
	'MMM D, YYYY',
	'MMM DD, YYYY',
	'MMMM D, YYYY',
	'MMMM DD, YYYY',
];

const formatGroupSessionTableDate = (rawDate?: string | null, description?: string | null) => {
	if (rawDate) {
		const parsedRawDate = moment(rawDate);

		if (parsedRawDate.isValid()) {
			return parsedRawDate.format(GROUP_SESSION_TABLE_DATE_FORMAT);
		}
	}

	if (!description) {
		return '';
	}

	const parsedDescription = moment(description, GROUP_SESSION_TABLE_DATE_INPUT_FORMATS, true);

	if (parsedDescription.isValid()) {
		return parsedDescription.format(GROUP_SESSION_TABLE_DATE_FORMAT);
	}

	return description;
};

const GROUP_SESSION_TABLE_TIME_FORMAT = 'h:mmA';
const GROUP_SESSION_TABLE_TIME_INPUT_FORMATS = ['HH:mm', 'H:mm', 'h:mm A', 'hh:mm A'];

const formatGroupSessionTableTime = (rawTime?: string | null, description?: string | null) => {
	if (rawTime) {
		const parsedRawTime = moment(rawTime, GROUP_SESSION_TABLE_TIME_INPUT_FORMATS, true);

		if (parsedRawTime.isValid()) {
			return parsedRawTime.format(GROUP_SESSION_TABLE_TIME_FORMAT);
		}
	}

	if (!description) {
		return '';
	}

	const parsedDescription = moment(description, GROUP_SESSION_TABLE_TIME_INPUT_FORMATS, true);

	if (parsedDescription.isValid()) {
		return parsedDescription.format(GROUP_SESSION_TABLE_TIME_FORMAT);
	}

	return description;
};

interface AdminGroupSessionsLoaderData {
	groupSessionsPromise: Promise<[GetGroupSessionsResponseBody, GetGroupSessionCountsResponseBody]>;
}

export function useAdminGroupSessionsLoaderData() {
	return useRouteLoaderData('admin-group-sessions') as AdminGroupSessionsLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const pageNumber = parseInt(url.searchParams.get('pageNumber') ?? '0', 10);
	const search = url.searchParams.get('search');
	const groupSessionStatusId = url.searchParams.get('groupSessionStatusId');
	const groupSessionSchedulingSystemId = url.searchParams.get('groupSessionSchedulingSystemId');
	const contentVisibilityTypeId = url.searchParams.get('contentVisibilityTypeId')
		? (url.searchParams.get('contentVisibilityTypeId') as CONTENT_VISIBILITY_TYPE_ID)
		: null;
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

	if (contentVisibilityTypeId) {
		queryParams.contentVisibilityTypeId = contentVisibilityTypeId;
	}

	if (search) {
		queryParams.searchQuery = search;
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
	const initialSearchValue = searchParams.get('search');

	const [isLoading, setIsLoading] = useState(false);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const [groupSessionsTotalCount, setGroupSessionsTotalCount] = useState(0);
	const [groupSessionsTotalCountDescription, setGroupSessionsTotalCountDescription] = useState('0');

	const [searchInputValue, setSearchInputValue] = useState(initialSearchValue);
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebouncedState(searchInputValue);
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

	useEffect(() => {
		searchParams.delete('pageNumber');

		if (debouncedSearchQuery) {
			searchParams.set('search', debouncedSearchQuery);
		} else {
			searchParams.delete('search');
		}

		setSearchParams(searchParams);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchQuery]);

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
			<SelectGroupSessionTypeModal
				show={showAddGroupSessionModal}
				onHide={() => {
					setShowAddGroupSessionModal(false);
				}}
				onContinue={({ groupSessionSchedulingSystemId }) => {
					const destination = `/admin/group-sessions/${
						groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL
							? 'add-external'
							: 'add-internal'
					}`;

					navigate(destination);
				}}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Group Sessions</h2>
							<div className="d-flex align-items-center">
								<Button
									variant="primary"
									size="sm"
									className="d-flex align-items-center"
									onClick={() => {
										setShowAddGroupSessionModal(true);
									}}
								>
									<SvgIcon kit="fas" icon="plus" size={16} className="me-2" />
									Add Group Session
								</Button>
								<InputHelperSearch
									className="ms-2"
									style={{ width: 335 }}
									placeholder="Search"
									value={searchInputValue ?? ''}
									onChange={({ currentTarget }) => {
										setSearchInputValue(currentTarget.value);
									}}
									onClear={() => {
										setSearchInputValue('');
										setDebouncedSearchQuery('');
										searchParams.delete('search');
										searchParams.delete('pageNumber');
										setSearchParams(searchParams);
									}}
								/>
							</div>
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
											<TableCell header minWidth="max-content">
												Session Date and Time
											</TableCell>
											<TableCell header width={400}>
												Session
											</TableCell>
											<TableCell header>Facilitator</TableCell>
											<TableCell header>Registrations</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header>Visibility</TableCell>
											<TableCell header>Scheduling</TableCell>
											<TableCell header minWidth="align-items-end">
												Date Added
											</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										{groupSessions.map((groupSession) => {
											const linkToEdit =
												groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW;
											return (
												<TableRow key={groupSession.groupSessionId}>
													<TableCell className="text-nowrap" minWidth="max-content">
														<span className="d-block">
															{formatGroupSessionTableDate(
																groupSession.startDate,
																groupSession.startDateDescription
															)}
														</span>
														<span className="d-block text-muted">
															{formatGroupSessionTableTime(
																groupSession.startTime,
																groupSession.startTimeDescription
															)}
														</span>
													</TableCell>
													<TableCell width={400}>
														<div className="d-flex align-items-center">
															<div className="text-truncate me-5">
																<Link
																	className="text-decoration-none"
																	to={`/admin/group-sessions/${
																		linkToEdit ? 'edit' : 'view'
																	}/${groupSession.groupSessionId}`}
																>
																	{groupSession.title}
																</Link>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<span className="d-block">{groupSession.facilitatorName}</span>
														<span className="d-block text-muted">
															{groupSession.facilitatorEmailAddress}
														</span>
													</TableCell>
													<TableCell>
														{groupSession.seatsReserved > 0 ? (
															<>
																<Link
																	className="text-decoration-none"
																	to={{
																		pathname: `/admin/group-sessions/view/${groupSession.groupSessionId}`,
																		search: '?tab=registrants',
																	}}
																>
																	{groupSession.seatsReserved}
																</Link>
																/{groupSession.seats ?? 'N/A'}
															</>
														) : (
															`${groupSession.seatsReserved ?? 'N/A'} / ${
																groupSession.seats ?? 'N/A'
															}`
														)}
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
														{groupSession.groupSessionStatusId ===
															GROUP_SESSION_STATUS_ID.NEW && (
															<Badge pill bg="outline-warning" className="text-nowrap">
																{groupSession.groupSessionStatusIdDescription}
															</Badge>
														)}
													</TableCell>
													<TableCell>
														{groupSession.groupSessionVisibilityTypeId ===
														CONTENT_VISIBILITY_TYPE_ID.PUBLIC ? (
															<span className="text-success">Public</span>
														) : (
															<span className="text-danger">Unlisted</span>
														)}
													</TableCell>
													<TableCell>
														{groupSession.groupSessionSchedulingSystemId ===
														GroupSessionSchedulingSystemId.COBALT
															? 'Cobalt'
															: 'External'}
													</TableCell>
													<TableCell className="text-nowrap" minWidth="max-content">
														{formatGroupSessionTableDate(
															groupSession.created,
															groupSession.createdDateDescription
														)}
													</TableCell>
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
										disabled={isLoading}
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
