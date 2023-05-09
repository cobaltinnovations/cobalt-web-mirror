import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import InputHelper from '@/components/input-helper';

import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import {
	PatientOrderFilterFlagTypeId,
	PatientOrderResourceCheckInResponseStatusId,
	PatientOrderResourcingStatusId,
	PatientOrderScreeningStatusId,
} from '@/lib/models';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import { useSearchParams } from 'react-router-dom';

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

interface Filter {
	filterId: string;
	title: string;
	options: {
		title: string;
		value: string;
	}[];
}

const MHIC_FITER_QUERY_PARAMS = [
	'patientOrderFilterFlagTypeId',
	'referringPracticeNames',
	'reasonsForReferral',
	'patientOrderScreeningStatusId',
	'patientOrderResourcingStatusId',
	'patientOrderResourceCheckInResponseStatusId',
];

export function parseMhicFilterQueryParamsFromURL(url: URL) {
	const parsed: Record<string, string[]> = {};

	for (const param of MHIC_FITER_QUERY_PARAMS) {
		parsed[param] = url.searchParams.getAll(param);
	}

	return parsed;
}

export const MhicFilterDropdown = ({ align, className }: Props) => {
	const classes = useStyles();
	const [show, setShow] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const availableFilters = useMemo<Filter[]>(() => {
		return [
			{
				filterId: 'patientOrderFilterFlagTypeId',
				title: 'Flag',
				options: [
					{
						title: 'None',
						value: PatientOrderFilterFlagTypeId.NONE,
					},
					{
						title: 'Patient below age threshold',
						value: PatientOrderFilterFlagTypeId.PATIENT_BELOW_AGE_THRESHOLD,
					},
					{
						title: 'Most recent episode closed within date threshold',
						value: PatientOrderFilterFlagTypeId.MOST_RECENT_EPISODE_CLOSED_WITHIN_DATE_THRESHOLD,
					},
				],
			},
			{
				filterId: 'referringPracticeNames',
				title: 'Practice',
				options: referenceDataResponse.referringPracticeNames.map((p) => {
					return {
						title: p,
						value: p,
					};
				}),
			},
			{
				filterId: 'reasonsForReferral',
				title: 'Referral Reason',
				options: referenceDataResponse.reasonsForReferral.map((r) => {
					return {
						title: r,
						value: r,
					};
				}),
			},
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
						title: 'Compelte',
						value: PatientOrderScreeningStatusId.COMPLETE,
					},
				],
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
		];
	}, [referenceDataResponse.reasonsForReferral, referenceDataResponse.referringPracticeNames]);

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
	}, [availableFilters, searchParams, show]);

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

							for (const filter of availableFilters) {
								searchParams.delete(filter.filterId);
							}

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

							const filters = Object.entries(selectedFilters).reduce(
								(params, [filterId, filterValue]) => {
									if (filterValue) {
										params.set(filterId, filterValue);
									}

									return params;
								},
								searchParams
							);

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
