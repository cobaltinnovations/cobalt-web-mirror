import React, { FC, useState, useMemo, useEffect } from 'react';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { useTable, useFilters, useGlobalFilter, useSortBy } from 'react-table';
import { createUseStyles } from 'react-jss';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import { SelectFilter } from '@/pages/pic/mhic-dashboard/select-filter';
import PatientDetailView from '@/pages/pic/mhic-dashboard/patient-detail-view';
import { ReactComponent as PinOn } from '@/assets/pic/icon_pin_on.svg';
import { ReactComponent as PinOff } from '@/assets/pic/icon_pin_off.svg';
import { ReactComponent as Flag } from '@/assets/pic/flag_icon.svg';
import { ReactComponent as Safety } from '@/assets/pic/safety_icon.svg';
import { ReactComponent as FilterIcon } from '@/assets/icons/icon-filter.svg';

import { FormattedDispositionWithAppointments, TriageReview, UpdateTriageReview, FlagType, TriageEnums } from '@/pages/pic/utils';
import { usePrevious } from '@/hooks/use-previous';
import { updateTriageReview } from '@/hooks/pic-hooks';
import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import classNames from 'classnames';
import colors from '@/jss/colors';
import { useHistory } from 'react-router-dom';

interface Props {
	dispositions: FormattedDispositionWithAppointments[];
	selectedDisposition: FormattedDispositionWithAppointments;
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

export const DetailTable: FC<Props> = ({ dispositions, selectedDisposition }) => {
	const { t } = useTranslation();
	const classes = useStyles();
	const queryClient = useQueryClient();
	const history = useHistory();

	const columns = useMemo(
		() => [
			{
				Header: '',
				accessor: 'flag.type',
				className: 'sticky',
				headerClassName: 'sticky',
			},
			{ Header: 'Status', accessor: 'flag.label', width: '50' },
			{ Header: 'Patient Name', accessor: 'displayName' },
		],
		[]
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		state,
		preFilteredRows,
		setGlobalFilter,
		setFilter,
		setAllFilters,
		// @ts-ignore
	} = useTable<FormattedDispositionWithAppointments>({ columns, data: dispositions }, useFilters, useGlobalFilter, useSortBy);

	const postUpdatedTriageReview = async ({ dispositionId, body }: { dispositionId: string; body: UpdateTriageReview }) => {
		return updateTriageReview(dispositionId, body);
	};

	const { mutate } = useMutation(postUpdatedTriageReview, {
		onSuccess: () => {
			queryClient.invalidateQueries('disposition');
		},
	});

	const closeDetail = () => {
		history.push('/pic/mhic');
	};

	const rowClickHandler = (id: string) => {
		history.push(`/pic/mhic/disposition/${id}`);
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
										className={`${selectedDisposition.id === row.original.id ? 'bg-info' : 'bg-white'} border-bottom`}
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
				<PatientDetailView selectedDispositionId={selectedDisposition.id} disposition={selectedDisposition} onCloseClick={closeDetail} />
			</Row>
			{dispositions.length <= 0 && (
				<Row className={`justify-content-center font-karla-regular text-danger`}>
					<p>No Patient Data Available</p>
				</Row>
			)}
		</>
	);
};
