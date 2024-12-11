import { cloneDeep } from 'lodash';
import React, { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { Table, TableHead, TableCell, TableBody, TableRow, TablePagination } from '@/components/table';
import SessionRequestRow from '@/components/session-request-row';
import QuickFilterDropdown from '@/components/quick-filter-dropdown';

import { groupSessionsService } from '@/lib/services/group-sessions-service';
import { GroupSessionRequestModel, GROUP_SESSION_STATUS_ID } from '@/lib/models';

import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import HeroContainer from '@/components/hero-container';

const useStyles = createUseThemedStyles((theme) => ({
	filterIcon: {
		marginRight: 10,
		'& polyline, & polygon': {
			fill: theme.colors.n500,
		},
	},
}));

const GroupSessionsByRequest: FC = () => {
	const classes = useStyles();
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [sizeOfPage] = useState(10);
	const [currentPageIndex, setCurrentPageIndex] = useState(0);
	const [statusFilterValue, setStatusFilterValue] = useState<GROUP_SESSION_STATUS_ID | undefined>(undefined);

	const [tableIsUpdating, setTableIsUpdating] = useState(false);
	const [sessions, setSessions] = useState<GroupSessionRequestModel[]>([]);
	const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);

	useEffect(() => {
		async function getTablePage() {
			setTableIsUpdating(true);

			try {
				const { groupSessionRequests, totalCount } = await groupSessionsService
					.getGroupSessionRequests({
						viewType: 'ADMINISTRATOR',
						pageNumber: currentPageIndex,
						pageSize: sizeOfPage,
						...(statusFilterValue ? { groupSessionRequestStatusId: statusFilterValue } : {}),
					})
					.fetch();

				setSessions(groupSessionRequests);
				setTotalNumberOfItems(totalCount);
			} catch (error) {
				handleError(error);
			}

			setTableIsUpdating(false);
		}

		getTablePage();
	}, [currentPageIndex, handleError, sizeOfPage, statusFilterValue]);

	function handleAddGroupSessionOptionButtonClick() {
		navigate('/group-sessions/by-request/create');
	}

	function handleStatusFilterChange(value: GROUP_SESSION_STATUS_ID | undefined) {
		setStatusFilterValue(value);
	}

	function handleSessionEditClicked(groupSessionRequestId: string) {
		navigate(`/group-sessions/by-request/${groupSessionRequestId}/edit`);
	}

	async function handleSessionActionClicked(
		groupSessionRequestId: string,
		actionId: GROUP_SESSION_STATUS_ID.ADDED | GROUP_SESSION_STATUS_ID.ARCHIVED | GROUP_SESSION_STATUS_ID.DELETED
	) {
		if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
			if (!window.confirm('Are you sure you want to delete this group session?')) {
				return;
			}
		}

		const sessionsClone = cloneDeep(sessions);
		const replacementIndex = sessions.findIndex(
			(session) => session.groupSessionRequestId === groupSessionRequestId
		);

		setTableIsUpdating(true);

		try {
			const { groupSessionRequest } = await groupSessionsService
				.updateGroupSessionRequestStatusById(groupSessionRequestId, actionId)
				.fetch();

			if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
				sessionsClone.splice(replacementIndex, 1);
			} else {
				sessionsClone.splice(replacementIndex, 1, groupSessionRequest);
			}

			setSessions(sessionsClone);
		} catch (error) {
			handleError(error);
		}

		setTableIsUpdating(false);
	}

	function handlePaginationClick(index: number) {
		setCurrentPageIndex(index);
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Sessions - By Request</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-0 text-center">Group Sessions - By Request</h2>
			</HeroContainer>
			<Container className="pt-6">
				<Row className="mb-5">
					<Col>
						<div className="d-flex justify-content-between">
							<Button size="sm" onClick={handleAddGroupSessionOptionButtonClick}>
								+ Add Group Session by Request
							</Button>
							<div className="d-flex align-items-center justify-content-center">
								<FilterIcon className={classes.filterIcon} />
								<small className="mb-0 me-2 text-uppercase text-muted fw-bold">Quick Filters:</small>
								<QuickFilterDropdown
									active={!!statusFilterValue}
									value={statusFilterValue}
									id="status-quick-filter"
									title="Status"
									items={[
										{
											value: undefined,
											label: 'No Filter',
										},
										{
											value: GROUP_SESSION_STATUS_ID.NEW,
											label: 'Pending',
										},
										{
											value: GROUP_SESSION_STATUS_ID.ADDED,
											label: 'Live',
										},
										{
											value: GROUP_SESSION_STATUS_ID.ARCHIVED,
											label: 'Archived',
										},
									]}
									onChange={(value) =>
										handleStatusFilterChange(value as GROUP_SESSION_STATUS_ID | undefined)
									}
								/>
							</div>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<Table className="mb-5" style={{ opacity: tableIsUpdating ? 0.5 : 1 }}>
							<TableHead>
								<TableRow>
									<TableCell header>Date Added</TableCell>
									<TableCell header>Session</TableCell>
									<TableCell header>Status</TableCell>
									<TableCell header />
								</TableRow>
							</TableHead>
							{sessions && sessions.length > 0 && (
								<TableBody>
									{sessions.map((session) => {
										return (
											<SessionRequestRow
												key={session.groupSessionRequestId}
												session={session}
												onEditClick={handleSessionEditClicked}
												onAddClick={(sessionId) => {
													handleSessionActionClicked(
														sessionId,
														GROUP_SESSION_STATUS_ID.ADDED
													);
												}}
												onArchiveClick={(sessionId) => {
													handleSessionActionClicked(
														sessionId,
														GROUP_SESSION_STATUS_ID.ARCHIVED
													);
												}}
												onUnarchiveClick={(sessionId) => {
													handleSessionActionClicked(
														sessionId,
														GROUP_SESSION_STATUS_ID.ADDED
													);
												}}
												onDeleteClick={(sessionId) => {
													handleSessionActionClicked(
														sessionId,
														GROUP_SESSION_STATUS_ID.DELETED
													);
												}}
											/>
										);
									})}
								</TableBody>
							)}
						</Table>
						{sessions && sessions.length > 0 && (
							<div className="d-flex justify-content-center">
								<TablePagination
									total={totalNumberOfItems}
									page={currentPageIndex}
									size={sizeOfPage}
									onClick={handlePaginationClick}
									disabled={tableIsUpdating}
								/>
							</div>
						)}
						{(!sessions || sessions.length <= 0) && (
							<>
								{statusFilterValue && (
									<div className="text-center">
										<p>No sessions found for filter.</p>
										<Button
											size="sm"
											onClick={() => {
												setStatusFilterValue(undefined);
											}}
										>
											Clear Filter
										</Button>
									</div>
								)}
								{!statusFilterValue && (
									<p className="text-center">There are no group session requests yet.</p>
								)}
							</>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default GroupSessionsByRequest;
