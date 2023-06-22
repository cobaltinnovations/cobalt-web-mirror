import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';

import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import {
	PatientOrderAssignmentStatusId,
	PatientOrderResourceCheckInResponseStatusId,
	PatientOrderResourcingStatusId,
	PatientOrderScreeningStatusId,
} from '@/lib/models';

enum FilterTypeId {
	SELECT = 'SELECT',
	DATE = 'DATE',
}

interface Filter {
	filterId: string;
	title: string;
	options: {
		title: string;
		value: string;
	}[];
	filterTypeId?: FilterTypeId;
}

const availableFilters: Filter[] = [
	{
		filterId: 'patientOrderScreeningStatusId',
		title: 'Assessment Status',
		options: [
			{
				title: 'Not screened',
				value: PatientOrderScreeningStatusId.NOT_SCREENED,
			},
			{
				title: 'In progress',
				value: PatientOrderScreeningStatusId.IN_PROGRESS,
			},
			{
				title: 'Scheduled',
				value: PatientOrderScreeningStatusId.SCHEDULED,
			},
			{
				title: 'Complete',
				value: PatientOrderScreeningStatusId.COMPLETE,
			},
		],
	},
	{
		filterId: 'patientOrderScheduledScreeningScheduledDate',
		title: 'Assessment Scheduled Date',
		options: [],
		filterTypeId: FilterTypeId.DATE,
	},
	{
		filterId: 'patientOrderResourcingStatusId',
		title: 'Resource Status',
		options: [
			{
				title: 'None needed',
				value: PatientOrderResourcingStatusId.NONE_NEEDED,
			},
			{
				title: 'Needs resources',
				value: PatientOrderResourcingStatusId.NEEDS_RESOURCES,
			},
			{
				title: 'Sent resources',
				value: PatientOrderResourcingStatusId.SENT_RESOURCES,
			},
			{
				title: 'Unknown',
				value: PatientOrderResourcingStatusId.UNKNOWN,
			},
		],
	},
	{
		filterId: 'patientOrderResourceCheckInResponseStatusId',
		title: 'Resource Check-In Response',
		options: [
			{
				title: 'None',
				value: PatientOrderResourceCheckInResponseStatusId.NONE,
			},
			{
				title: 'No longer need care',
				value: PatientOrderResourceCheckInResponseStatusId.NO_LONGER_NEED_CARE,
			},
			{
				title: 'Need followup',
				value: PatientOrderResourceCheckInResponseStatusId.NEED_FOLLOWUP,
			},
			{
				title: 'Appointment scheduled',
				value: PatientOrderResourceCheckInResponseStatusId.APPOINTMENT_SCHEDULED,
			},
			{
				title: 'Appointment attended',
				value: PatientOrderResourceCheckInResponseStatusId.APPOINTMENT_ATTENDED,
			},
		],
	},
	{
		filterId: 'patientOrderAssignmentStatusId',
		title: 'Assignment Status',
		options: [
			{
				title: 'Unassigned',
				value: PatientOrderAssignmentStatusId.UNASSIGNED,
			},
			{
				title: 'Assigned',
				value: PatientOrderAssignmentStatusId.ASSIGNED,
			},
		],
	},
];

const mhicFilterQueryParams = availableFilters.reduce((accumulator, currentValue) => {
	return [...accumulator, currentValue.filterId];
}, [] as string[]);

export function parseMhicFilterQueryParamsFromSearchParams(searchParams: URLSearchParams) {
	const parsed: Record<string, string[]> = {};

	for (const param of mhicFilterQueryParams) {
		parsed[param] = searchParams.getAll(param);
	}

	return parsed;
}

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenuBody: {
		width: 576,
		padding: '16px 24px',
	},
	dropdownMenuFooter: {
		textAlign: 'right',
		padding: '12px 16px',
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.n100}`,
	},
}));

interface Props {
	align?: AlignType;
	className?: string;
}

export const MhicFilterDropdown = ({ align, className }: Props) => {
	const classes = useStyles();
	const [show, setShow] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

	const handleFilterAddButtonClick = useCallback((filterId: string) => {
		setSelectedFilters((previousValue) => ({ ...previousValue, [filterId]: '' }));
	}, []);

	const handleFilterRemoveButtonClick = useCallback((filterId: string) => {
		setSelectedFilters((previousValue) => {
			delete previousValue[filterId];
			return { ...previousValue };
		});
	}, []);

	const handleFilterChange = useCallback((filterId: string, value: string) => {
		setSelectedFilters((previousValue) => {
			previousValue[filterId] = value;
			return { ...previousValue };
		});
	}, []);

	useEffect(() => {
		if (show) {
			const active: typeof selectedFilters = {};

			for (const filter of availableFilters) {
				const value = searchParams.get(filter.filterId);

				if (value) {
					active[filter.filterId] = value;
				}
			}

			setSelectedFilters(active);
		}
	}, [searchParams, show]);

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={setShow}
		>
			<Dropdown.Toggle
				as={DropdownToggle}
				className="d-inline-flex align-items-center"
				id="order-filters--add-filter"
			>
				<FilterIcon className="me-2" />
				<span>Filter</span>
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				className="p-0"
				align={align ?? 'start'}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
			>
				<div className={classes.dropdownMenuBody}>
					{Object.entries(selectedFilters).map(([filterId, value]) => {
						const filter = availableFilters.find((filter) => filter.filterId === filterId);

						if (!filter) {
							return null;
						}

						return (
							<div key={filterId} className="mb-3 d-flex align-items-center">
								{filter.filterTypeId === FilterTypeId.DATE ? (
									<div className="flex-grow-1 me-2">
										<DatePicker
											labelText={filter.title}
											selected={value ? moment(value, 'YYYY-MM-DD').toDate() : undefined}
											onChange={(date) => {
												if (date) {
													handleFilterChange(filterId, moment(date).format('YYYY-MM-DD'));
												} else {
													handleFilterChange(filterId, '');
												}
											}}
										/>
									</div>
								) : (
									<InputHelper
										as="select"
										className="flex-grow-1 me-2"
										label={filter.title}
										value={value}
										onChange={({ currentTarget }) => {
											handleFilterChange(filterId, currentTarget.value);
										}}
									>
										<option value="" label={`Select ${filter.title}`} disabled />
										{filter.options.map((option) => (
											<option key={option.value} value={option.value}>
												{option.title}
											</option>
										))}
									</InputHelper>
								)}
								<Button
									variant="light"
									className="p-2 flex-shrink-0"
									onClick={() => {
										handleFilterRemoveButtonClick(filterId);
									}}
								>
									<CloseIcon />
								</Button>
							</div>
						);
					})}
					<Dropdown className="d-flex align-items-center">
						<Dropdown.Toggle
							as={DropdownToggle}
							id="order-filters--select-filter"
							className="d-inline-flex align-items-center"
						>
							<PlusIcon className="me-2" />
							<span>Add Filter</span>
							<ArrowDown className="ms-2" />
						</Dropdown.Toggle>
						<Dropdown.Menu
							as={DropdownMenu}
							align="start"
							flip={false}
							popperConfig={{ strategy: 'fixed' }}
							renderOnMount
						>
							{availableFilters.map((filter) => {
								if (Object.keys(selectedFilters).includes(filter.filterId)) {
									return null;
								}

								return (
									<Dropdown.Item
										key={filter.filterId}
										onClick={() => {
											handleFilterAddButtonClick(filter.filterId);
										}}
									>
										{filter.title}
									</Dropdown.Item>
								);
							})}
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="outline-primary"
						size="sm"
						className="me-2"
						onClick={() => {
							setSelectedFilters({});
							setShow(false);

							for (const param of mhicFilterQueryParams) {
								searchParams.delete(param);
							}

							searchParams.set('pageNumber', '0');
							setSearchParams(searchParams);
						}}
					>
						Clear All
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							setShow(false);

							for (const param of mhicFilterQueryParams) {
								searchParams.delete(param);
							}

							const filters = Object.entries(selectedFilters).reduce(
								(params, [filterId, filterValue]) => {
									if (filterValue) {
										params.set(filterId, filterValue);
									}

									return params;
								},
								searchParams
							);

							filters.set('pageNumber', '0');
							setSearchParams(filters);
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
