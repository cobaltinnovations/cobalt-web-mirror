import React, { FC, useEffect, useMemo } from 'react';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { useTable, useFilters, useGlobalFilter, useSortBy } from 'react-table';
import { createUseStyles } from 'react-jss';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { SelectFilter } from '@/pages/pic/mhic-dashboard/select-filter';
import { ReactComponent as PinOn } from '@/assets/pic/icon_pin_on.svg';
import { ReactComponent as PinOff } from '@/assets/pic/icon_pin_off.svg';
import { ReactComponent as Flag } from '@/assets/pic/flag_icon.svg';
import { ReactComponent as Safety } from '@/assets/pic/safety_icon.svg';
import { ReactComponent as FilterIcon } from '@/assets/icons/icon-filter.svg';
import { FormattedDispositionWithAppointments, TriageReview, FlagType, TriageEnums } from '@/pages/pic/utils';
import { useUpdateTriageReview } from '@/hooks/pic-hooks';
import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import colors from '@/jss/colors';
import useQuery from '@/hooks/use-query';

interface Props {
	dispositions: FormattedDispositionWithAppointments[];
}

const useStyles = createUseStyles({
	tableWrapper: {
		maxHeight: '70vh!important',
		height: '70vh!important',
		overflow: 'scroll!important',
	},
	tableCell: {
		textOverflow: 'ellipsis',
		maxWidth: '150px',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
	},
	inputStyles: {
		background: 'none',
		border: 'none',
	},
	inputWrapper: {
		borderRadius: '20px',
		border: `1px solid ${colors.dark}`,
	},
	low: {
		padding: '0.01px 9px',
		background: colors.success,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
	medium: {
		padding: '0.01px 9px',
		background: colors.secondary,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
	high: {
		padding: '0.01px 9px',
		background: colors.danger,
		borderRadius: '50%',
		transform: 'scale(0.1, 0.1)',
	},
});

export const PatientTable: FC<Props> = ({ dispositions }) => {
	const { t } = useTranslation();
	const classes = useStyles();
	const history = useHistory();
	const queryParams = useQuery();

	const initialSortState = useMemo(() => {
		const currentSortBy = queryParams.getAll('sort');

		const parsed = [];
		for (const sortBy of currentSortBy) {
			const [id, desc] = sortBy.split(':');
			parsed.push({ id, desc: desc === 'desc' });
		}

		return parsed;
	}, [queryParams]);

	const columns = useMemo(
		() => [
			{
				Header: '',
				accessor: 'flag.type',
				className: 'sticky',
				headerClassName: 'sticky',
			},
			{
				Header: 'Status',
				accessor: 'flag.label',
				width: '50',
			},
			{ Header: 'Patient Name', accessor: 'displayName' },
			{ Header: 'Pref. Phone', accessor: 'patient.preferredPhoneNumber' },
			{ Header: 'Engage', accessor: 'preferredEngagement' },
			{ Header: 'Schedule', accessor: 'appointments[0].formattedTableDate' },
			{ Header: 'Last Contact', accessor: 'lastContact' },
			{ Header: 'Acuity', accessor: 'displayAcuity' },
			{ Header: 'Triage', accessor: 'displayTriage' },
			{ Header: 'Pin', accessor: 'pinned' },
			{ Header: 'BHP Review', accessor: 'bhpReviewed' },
			{ Header: 'Psych Review', accessor: 'psyReviewed' },
		],
		[]
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state, preFilteredRows, setGlobalFilter, setFilter, setAllFilters } = useTable<
		FormattedDispositionWithAppointments
	>(
		{
			// @ts-ignore
			columns,
			data: dispositions,
			initialState: {
				sortBy: initialSortState,
			},
		},
		useFilters,
		useGlobalFilter,
		useSortBy
	);

	useEffect(() => {
		const newParams = new URLSearchParams();

		for (const sortBy of state.sortBy) {
			console.log({ sortBy });
			newParams.append('sort', `${sortBy.id}:${sortBy.desc ? 'desc' : 'asc'}`);
		}

		const oldParams = queryParams.toString();
		const nextParams = newParams.toString();

		if (nextParams !== oldParams) {
			history.replace({
				...history.location,
				search: nextParams,
			});
		}
	}, [history, queryParams, state.sortBy]);

	const { mutate } = useUpdateTriageReview();

	const rowClickHandler = (id: string) => {
		history.push(`/pic/mhic/disposition/${id}`);
	};

	const pinClickHandler = (e: React.MouseEvent, id: string, value: boolean, triage: TriageReview, row: FormattedDispositionWithAppointments) => {
		e.stopPropagation();
		handlePostForUpdatedTriage(id, 'pinned', triage, row, value);
	};

	const checkClickHandler = (e: React.MouseEvent, id: string, column: string, triage: TriageReview, row: FormattedDispositionWithAppointments) => {
		e.stopPropagation();
		handlePostForUpdatedTriage(id, column, triage, row);
	};

	const handlePostForUpdatedTriage = (
		id: string,
		column: string,
		triage: TriageReview,
		row: FormattedDispositionWithAppointments,
		value: undefined | boolean = undefined
	) => {
		const bhpDateString = triage?.bhpReviewedDt ? null : moment().format();
		const psyDateString = triage?.psychiatristReviewedDt ? null : moment().format();
		let bhpUpdated = false;
		let psyUpdated = false;

		if (column === 'bhpReviewed') {
			bhpUpdated = triage.bhpReviewedDt !== bhpDateString;
		}

		if (column === 'psyReviewed') {
			psyUpdated = triage.psychiatristReviewedDt !== psyDateString;
		}

		const needsReviewUpdated = column === 'pinned' ? !value : triage?.needsFocusedReview;

		const triageReviewForPost = {
			bhpReviewedDt: bhpUpdated ? bhpDateString : triage ? triage.bhpReviewedDt : null,
			psychiatristReviewedDt: psyUpdated ? psyDateString : triage ? triage.psychiatristReviewedDt : null,
			comment: triage ? triage.comment : '',
			needsFocusedReview: needsReviewUpdated || false,
		};

		mutate({ dispositionId: id, body: triageReviewForPost });
	};

	const isChecked = (triage: TriageReview, id: 'bhpReviewed' | 'psyReviewed') => {
		if (id === 'bhpReviewed' && triage.bhpReviewedDt) {
			return true;
		}

		if (id === 'psyReviewed' && triage.psychiatristReviewedDt) {
			return true;
		}
		return false;
	};

	const determineClass = (acuity: TriageEnums | null | undefined) => {
		switch (acuity) {
			case TriageEnums.low:
				return classes.low;
			case TriageEnums.medium:
				return classes.medium;
			case TriageEnums.high:
				return classes.high;
			default:
				return '';
		}
	};

	return (
		<>
			<Row className="justify-content-between border-top w-100">
				<Col sm={'auto'} className="d-inline-flex p-1 m-2 align-items-center">
					<div className={classNames(`${classes.inputWrapper}`, 'position-relative d-flex align-items-center px-2 py-1 border-dark')}>
						<SearchIcon />
						<input
							onChange={(e) => setGlobalFilter(e.target.value)}
							value={state.globalFilter || ''}
							placeholder={t('mhic.filters.searchPlaceholder')}
							className={classes.inputStyles}
						/>
					</div>

					<span className={'pl-2'}>{t('mhic.filters.filteredPatientCount', { count: rows.length })}</span>
				</Col>
				<Col className="p-1 m-2 d-flex justify-content-end align-items-center">
					<FilterIcon className={'mr-1'} />
					{t('mhic.filters.filtersLabel')}
					<SelectFilter preFilteredRows={preFilteredRows} setFilter={setFilter} filters={state.filters} id={'flag.label'} />
					<SelectFilter preFilteredRows={preFilteredRows} setFilter={setFilter} filters={state.filters} id={'displayTriage'} />
					{/*{ (*/}
					<Button
						variant={'no-background'}
						// @ts-ignore
						size={'xsm'}
						onClick={() => {
							setAllFilters([]);
							setGlobalFilter('');
						}}
						className={'px-2 text-gray'}
					>
						{t('mhic.filters.clearButtonText')}
					</Button>
					{/*)}*/}
				</Col>
			</Row>
			<Row className={`${classes.tableWrapper} justify-content-center`}>
				<Col sm={'auto'} className={classes.tableWrapper}>
					<Table borderless hover {...getTableProps()}>
						<thead>
							{headerGroups.map((headerGroup) => (
								<tr {...headerGroup.getHeaderGroupProps()} className={'border-bottom'}>
									{headerGroup.headers.map((column) => (
										<th
											{...column.getHeaderProps(column.getSortByToggleProps())}
											className={'py-3 font-karla-regular text-gray text-uppercase'}
										>
											{column.render('Header')}
											<span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody {...getTableBodyProps()}>
							{rows.map((row) => {
								prepareRow(row);
								return (
									<tr
										{...row.getRowProps()}
										className={`bg-white border-bottom`}
										onClick={() => rowClickHandler(row.original.id)}
										data-cy="patient-table-row"
									>
										{row.cells.map((cell) => {
											if (cell.column.id === 'displayAcuity') {
												return (
													<td {...cell.getCellProps()} className={`py-3 ${classes.tableCell}`}>
														<span className={determineClass(row.original.acuity ? row.original.acuity.category : undefined)} />
														<span className="ml-1">{cell.render('Cell')}</span>
													</td>
												);
											}
											if (cell.column.id === 'flag.type') {
												return (
													<td {...cell.getCellProps()} className={'py-3'}>
														{cell.value === FlagType.Safety ? <Safety /> : cell.value === FlagType.General ? <Flag /> : ''}
													</td>
												);
											}
											if (cell.column.id === 'pinned') {
												return (
													<td
														{...cell.getCellProps()}
														className={'py-3'}
														onClick={(e) =>
															pinClickHandler(e, row.original.id, cell.value, row.original.triageReview, row.original)
														}
													>
														{cell.value ? <PinOn /> : <PinOff />}
													</td>
												);
											} else if (cell.column.id === 'bhpReviewed' || cell.column.id === 'psyReviewed') {
												return (
													<td
														{...cell.getCellProps()}
														className={`py-3 ${classes.tableCell}`}
														onClick={(e) =>
															checkClickHandler(e, row.original.id, cell.column.id, row.original.triageReview, row.original)
														}
													>
														<input
															data-cy={cell.column.id === 'bhpReviewed' ? 'table-bhp-review-input' : 'table-psy-review-input'}
															type="checkbox"
															name={cell.column.id}
															checked={isChecked(row.original.triageReview, cell.column.id)}
														/>
														<label htmlFor={cell.column.id} className="pl-1">
															{cell.column.id === 'bhpReviewed' ? 'Vallee' : 'Torday'}
														</label>
													</td>
												);
											}
											return (
												<td
													{...cell.getCellProps()}
													className={`py-3 ${classes.tableCell}`}
													id={cell.column.id === 'displayName' ? row.original.patient.lastName : ''}
												>
													{cell.render('Cell')}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</Table>
				</Col>
			</Row>
			{dispositions.length <= 0 && (
				<Row className={`justify-content-center font-karla-regular text-danger`}>
					<p>No Patient Data Available</p>
				</Row>
			)}
		</>
	);
};
