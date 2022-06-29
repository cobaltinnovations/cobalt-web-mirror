import { cloneDeep } from 'lodash';
import React, { FC, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';

import QuickFilterDropdown from '@/components/quick-filter-dropdown';
import { Table, TableHead, TableCell, TableBody, TableRow, TablePagination } from '@/components/table';
import SessionRow from '@/components/session-row';

import { groupSessionsService } from '@/lib/services/group-sessions-service';
import { GroupSessionModel, GROUP_SESSION_STATUS_ID, GroupSessionCountModel } from '@/lib/models';

import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	filterIcon: {
		marginRight: 10,
		'& polyline, & polygon': {
			fill: theme.colors.gray600,
		},
	},
}));

const GroupSessions: FC = () => {
	const classes = useStyles();
	const history = useHistory();
	const handleError = useHandleError();

	const [sizeOfPage] = useState(10);
	const [currentPageIndex, setCurrentPageIndex] = useState(0);
	const [statusFilterValue, setStatusFilterValue] = useState<GROUP_SESSION_STATUS_ID | undefined>(undefined);

	const [tableIsUpdating, setTableIsUpdating] = useState(false);
	const [sessions, setSessions] = useState<GroupSessionModel[]>([]);
	const [totalNumberOfItems, setTotalNumberOfItems] = useState(0);
	const [sessionCounts, setSessionCounts] = useState<GroupSessionCountModel[]>([]);

	useHeaderTitle('Studio Sessions - Scheduled');

	useEffect(() => {
		async function getTablePage() {
			setTableIsUpdating(true);

			try {
				const [{ groupSessions, totalCount }, { groupSessionCounts }] = await Promise.all([
					groupSessionsService
						.getGroupSessions({
							viewType: 'ADMINISTRATOR',
							pageNumber: currentPageIndex,
							pageSize: sizeOfPage,
							...(statusFilterValue ? { groupSessionStatusId: statusFilterValue } : {}),
						})
						.fetch(),
					groupSessionsService.getGroupSessionCounts().fetch(),
				]);

				setSessions(groupSessions);
				setTotalNumberOfItems(totalCount);
				setSessionCounts(groupSessionCounts);
			} catch (error) {
				handleError(error);
			}

			setTableIsUpdating(false);
		}

		getTablePage();
	}, [currentPageIndex, handleError, sizeOfPage, statusFilterValue]);

	function handleAddGroupSessionButtonClick() {
		history.push('/group-sessions/scheduled/create');
	}

	function handleStatusFilterChange(value: GROUP_SESSION_STATUS_ID | undefined) {
		setStatusFilterValue(value);
		setCurrentPageIndex(0);
	}

	function handleSessionEditClicked(groupSessionId: string) {
		history.push(`/group-sessions/scheduled/${groupSessionId}/edit`);
	}

	function handleSessionViewClicked(groupSessionId: string) {
		history.push(`/group-sessions/scheduled/${groupSessionId}/view`);
	}

	function handleSessionCreateCopyClicked(groupSessionId: string) {
		history.push(`/group-sessions/scheduled/create?groupSessionIdToCopy=${groupSessionId}`);
	}

	async function handleSessionActionClicked(
		groupSessionId: string,
		actionId: GROUP_SESSION_STATUS_ID.ADDED | GROUP_SESSION_STATUS_ID.CANCELED | GROUP_SESSION_STATUS_ID.DELETED
	) {
		if (actionId === GROUP_SESSION_STATUS_ID.CANCELED) {
			if (!window.confirm('Are you sure you want to cancel this studio session?')) {
				return;
			}
		}

		if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
			if (!window.confirm('Are you sure you want to delete this studio session?')) {
				return;
			}
		}

		const sessionsClone = cloneDeep(sessions);
		const replacementIndex = sessions.findIndex((session) => session.groupSessionId === groupSessionId);

		setTableIsUpdating(true);

		try {
			const { groupSession } = await groupSessionsService
				.updateGroupSessionStatusById(groupSessionId, actionId)
				.fetch();
			const { groupSessionCounts } = await groupSessionsService.getGroupSessionCounts().fetch();

			if (actionId === GROUP_SESSION_STATUS_ID.DELETED) {
				sessionsClone.splice(replacementIndex, 1);
			} else {
				sessionsClone.splice(replacementIndex, 1, groupSession);
			}

			setSessions(sessionsClone);
			setSessionCounts(groupSessionCounts);
		} catch (error) {
			handleError(error);
		}

		setTableIsUpdating(false);
	}

	function handlePaginationClick(index: number) {
		setCurrentPageIndex(index);
	}

	return (
		<Container className="pt-6">
			<Row className="mb-5">
				<Col>
					<div className="d-flex justify-content-between">
						<Button size="sm" onClick={handleAddGroupSessionButtonClick}>
							+ add studio session
						</Button>
						<div className="d-flex align-items-center justify-content-center">
							<FilterIcon className={classes.filterIcon} />
							<small className="mb-0 me-2 text-uppercase text-muted font-body-bold">Quick Filters:</small>
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
										label: 'New',
										count: groupSessionsService.getGroupSessionCountByStatusId(
											sessionCounts,
											GROUP_SESSION_STATUS_ID.NEW
										),
									},
									{
										value: GROUP_SESSION_STATUS_ID.ADDED,
										label: 'Live',
										count: groupSessionsService.getGroupSessionCountByStatusId(
											sessionCounts,
											GROUP_SESSION_STATUS_ID.ADDED
										),
									},
									{
										value: GROUP_SESSION_STATUS_ID.ARCHIVED,
										label: 'Archived',
										count: groupSessionsService.getGroupSessionCountByStatusId(
											sessionCounts,
											GROUP_SESSION_STATUS_ID.ARCHIVED
										),
									},
									{
										value: GROUP_SESSION_STATUS_ID.CANCELED,
										label: 'Canceled',
										count: groupSessionsService.getGroupSessionCountByStatusId(
											sessionCounts,
											GROUP_SESSION_STATUS_ID.CANCELED
										),
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
								<TableCell header>Facilitator</TableCell>
								<TableCell header className="justify-content-center">
									Attendees
								</TableCell>
								<TableCell header>Status</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						{sessions && sessions.length > 0 && (
							<TableBody>
								{sessions.map((session) => {
									return (
										<SessionRow
											key={session.groupSessionId}
											session={session}
											onEditClick={handleSessionEditClicked}
											onViewClick={handleSessionViewClicked}
											onCopyClick={handleSessionCreateCopyClicked}
											onAddClick={(sessionId) => {
												handleSessionActionClicked(sessionId, GROUP_SESSION_STATUS_ID.ADDED);
											}}
											onCancelClick={(sessionId) => {
												handleSessionActionClicked(sessionId, GROUP_SESSION_STATUS_ID.CANCELED);
											}}
											onDeleteClick={(sessionId) => {
												handleSessionActionClicked(sessionId, GROUP_SESSION_STATUS_ID.DELETED);
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
							/>
						</div>
					)}
					{(!sessions || sessions.length <= 0) && (
						<>
							{statusFilterValue && (
								<div className="text-center">
									<p>No studio sessions found for filter.</p>
									<Button
										size="sm"
										onClick={() => {
											setStatusFilterValue(undefined);
											setCurrentPageIndex(0);
										}}
									>
										clear filter
									</Button>
								</div>
							)}
							{!statusFilterValue && (
								<p className="text-center">There are no scheduled studio sessions yet.</p>
							)}
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
};

export default GroupSessions;
