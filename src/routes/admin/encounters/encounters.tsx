import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Container, Offcanvas, Row } from 'react-bootstrap';
import { Outlet, useLocation, useMatch, useNavigate, useSearchParams } from 'react-router-dom';

import InputHelperSearch from '@/components/input-helper-search';
import NoData from '@/components/no-data';
import TabBar from '@/components/tab-bar';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterModel, CareEncounterSortColumnId, CareEncounterStatusId, SortDirectionId } from '@/lib/models';
import { careEncounterService } from '@/lib/services';

const PAGE_SIZE = 25;

const useStyles = createUseThemedStyles((theme) => ({
	encounterShelf: {
		width: '95% !important',
		maxWidth: '800px !important',
		backgroundColor: theme.colors.n0,
	},
}));

export const Component = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const encounterShelfMatch = useMatch('/admin/encounters/:encounterId');
	const [searchParams, setSearchParams] = useSearchParams();
	const activeStatus = (searchParams.get('status') as CareEncounterStatusId) ?? CareEncounterStatusId.OPEN;
	const careEncounterSortColumnId =
		(searchParams.get('careEncounterSortColumnId') as CareEncounterSortColumnId) ??
		CareEncounterSortColumnId.APPOINTMENT_DATE;
	const sortDirectionId = (searchParams.get('sortDirectionId') as SortDirectionId) ?? SortDirectionId.DESCENDING;
	const tableSortDirection = sortDirectionId === SortDirectionId.ASCENDING ? SORT_DIRECTION.ASC : SORT_DIRECTION.DESC;
	const pageNumber = parseInt(searchParams.get('pageNumber') ?? '0', 10);
	const urlSearchQuery = searchParams.get('searchQuery') ?? '';

	const [isLoading, setIsLoading] = useState(true);
	const [careEncounters, setCareEncounters] = useState<CareEncounterModel[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [searchInputValue, setSearchInputValue] = useState(urlSearchQuery);
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebouncedState(searchInputValue);
	const careEncountersRequestRef = useRef<ReturnType<typeof careEncounterService.getCareEncounters>>();
	const syncingSearchFromUrlRef = useRef(false);

	const fetchCareEncounters = useCallback(async () => {
		careEncountersRequestRef.current?.abort();

		const request = careEncounterService.getCareEncounters({
			pageNumber,
			pageSize: PAGE_SIZE,
			careEncounterStatusId: activeStatus,
			careEncounterSortColumnId,
			sortDirectionId,
			...(urlSearchQuery ? { searchQuery: urlSearchQuery } : {}),
		});
		careEncountersRequestRef.current = request;

		setIsLoading(true);

		try {
			const response = await request.fetch();

			if (request === careEncountersRequestRef.current) {
				setCareEncounters(response.careEncounters);
				setTotalCount(response.totalCount);
			}
		} catch (error) {
			if (request === careEncountersRequestRef.current) {
				setCareEncounters([]);
				setTotalCount(0);
				handleError(error);
			}
		} finally {
			if (request === careEncountersRequestRef.current) {
				setIsLoading(false);
				careEncountersRequestRef.current = undefined;
			}
		}
	}, [activeStatus, careEncounterSortColumnId, handleError, pageNumber, sortDirectionId, urlSearchQuery]);

	useEffect(() => {
		fetchCareEncounters();

		return () => {
			careEncountersRequestRef.current?.abort();
			careEncountersRequestRef.current = undefined;
		};
	}, [fetchCareEncounters]);

	useEffect(() => {
		syncingSearchFromUrlRef.current = true;
		setSearchInputValue(urlSearchQuery);
		setDebouncedSearchQuery(urlSearchQuery);
	}, [setDebouncedSearchQuery, urlSearchQuery]);

	useEffect(() => {
		if (syncingSearchFromUrlRef.current) {
			if (debouncedSearchQuery === urlSearchQuery) {
				syncingSearchFromUrlRef.current = false;
			}

			return;
		}

		const normalizedSearchQuery = debouncedSearchQuery.trim();

		if (normalizedSearchQuery === urlSearchQuery) {
			return;
		}

		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);

				if (normalizedSearchQuery) {
					nextSearchParams.set('searchQuery', normalizedSearchQuery);
				} else {
					nextSearchParams.delete('searchQuery');
				}

				nextSearchParams.delete('pageNumber');
				return nextSearchParams;
			},
			{ replace: true }
		);
	}, [debouncedSearchQuery, setSearchParams, urlSearchQuery]);

	const updateSearchParams = (update: (nextSearchParams: URLSearchParams) => void) => {
		setSearchParams((currentSearchParams) => {
			const nextSearchParams = new URLSearchParams(currentSearchParams);
			update(nextSearchParams);
			return nextSearchParams;
		});
	};

	const handleTabClick = (status: string) => {
		updateSearchParams((nextSearchParams) => {
			nextSearchParams.set('status', status);
			nextSearchParams.delete('pageNumber');
		});
	};

	const handleSort = (sortColumnId: CareEncounterSortColumnId, direction: SORT_DIRECTION) => {
		updateSearchParams((nextSearchParams) => {
			nextSearchParams.set('careEncounterSortColumnId', sortColumnId);
			nextSearchParams.set(
				'sortDirectionId',
				direction === SORT_DIRECTION.ASC ? SortDirectionId.ASCENDING : SortDirectionId.DESCENDING
			);
			nextSearchParams.delete('pageNumber');
		});
	};

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row>
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between gap-4">
							<h2 className="mb-0">Encounters</h2>
							<InputHelperSearch
								style={{ width: 335 }}
								placeholder="Search"
								value={searchInputValue}
								onChange={({ currentTarget }) => {
									setSearchInputValue(currentTarget.value);
								}}
								onClear={() => {
									setSearchInputValue('');
									setDebouncedSearchQuery('');
									setSearchParams(
										(currentSearchParams) => {
											const nextSearchParams = new URLSearchParams(currentSearchParams);
											nextSearchParams.delete('searchQuery');
											nextSearchParams.delete('pageNumber');
											return nextSearchParams;
										},
										{ replace: true }
									);
								}}
							/>
						</div>
						<hr />
					</Col>
				</Row>

				<Row className="mb-8">
					<Col>
						<TabBar
							value={activeStatus}
							tabs={[
								{ value: CareEncounterStatusId.OPEN, title: 'Open' },
								{ value: CareEncounterStatusId.CLOSED, title: 'Closed' },
							]}
							onTabClick={handleTabClick}
						/>
					</Col>
				</Row>

				<Row className="mb-6">
					<Col>
						<Table isLoading={isLoading}>
							<TableHead>
								<TableRow>
									<TableCell
										header
										sortable
										minWidth="max-content"
										sortDirection={
											careEncounterSortColumnId === CareEncounterSortColumnId.CREATED
												? tableSortDirection
												: null
										}
										onSort={(direction) => handleSort(CareEncounterSortColumnId.CREATED, direction)}
									>
										Created
									</TableCell>
									<TableCell
										header
										sortable
										width="45%"
										sortDirection={
											careEncounterSortColumnId === CareEncounterSortColumnId.PATIENT_NAME
												? tableSortDirection
												: null
										}
										onSort={(direction) =>
											handleSort(CareEncounterSortColumnId.PATIENT_NAME, direction)
										}
									>
										Patient
									</TableCell>
									<TableCell
										header
										sortable
										width="45%"
										sortDirection={
											careEncounterSortColumnId === CareEncounterSortColumnId.APPOINTMENT_DATE
												? tableSortDirection
												: null
										}
										onSort={(direction) =>
											handleSort(CareEncounterSortColumnId.APPOINTMENT_DATE, direction)
										}
									>
										Appointment Date
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{!isLoading && careEncounters.length === 0 && (
									<TableRow>
										<TableCell colSpan={3}>
											<NoData title="No Encounters" actions={[]} />
										</TableCell>
									</TableRow>
								)}
								{careEncounters.map((careEncounter) => (
									<TableRow
										key={careEncounter.careEncounterId}
										onClick={() => {
											navigate({
												pathname: `/admin/encounters/${careEncounter.careEncounterId}`,
												search: location.search,
											});
										}}
									>
										<TableCell className="text-nowrap" minWidth="max-content">
											{careEncounter.createdDateDescription}
										</TableCell>
										<TableCell width="45%">
											{[careEncounter.appointment.firstName, careEncounter.appointment.lastName]
												.filter(Boolean)
												.join(' ')}
										</TableCell>
										<TableCell width="45%">
											<span className="d-block">
												{careEncounter.appointment.startTimeDescription}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Col>
				</Row>

				<Row>
					<Col>
						<div className="d-flex justify-content-center align-items-center">
							<TablePagination
								total={totalCount}
								page={pageNumber}
								size={PAGE_SIZE}
								disabled={isLoading}
								onClick={(pageIndex) => {
									updateSearchParams((nextSearchParams) => {
										nextSearchParams.set('pageNumber', String(pageIndex));
									});
								}}
							/>
						</div>
					</Col>
				</Row>
			</Container>

			<Offcanvas
				className={classes.encounterShelf}
				show={!!encounterShelfMatch}
				placement="end"
				onHide={() => {
					navigate({
						pathname: '/admin/encounters',
						search: location.search,
					});
				}}
			>
				<Outlet />
			</Offcanvas>
		</>
	);
};
