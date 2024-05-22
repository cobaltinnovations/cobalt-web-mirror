import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as SortIcon } from '@/assets/icons/sort.svg';
import { PatientOrderSortColumnId, SortDirectionId } from '@/lib/models';
import { useSearchParams } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenuBody: {
		width: 576,
		display: 'flex',
		padding: '16px 24px',
	},
	dropdownMenuFooter: {
		textAlign: 'right',
		padding: '12px 16px',
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.border}`,
	},
	flex1: {
		flex: 1,
	},
}));

interface MhicSortDropdownProps {
	align?: AlignType;
	className?: string;
}

export const mhicSortDropdownGetParsedQueryParams = (searchParams: URLSearchParams) => {
	return {
		patientOrderSortColumnId: searchParams.get('patientOrderSortColumnId') ?? '',
		sortDirectionId: searchParams.get('sortDirectionId') ?? '',
		sortNullsId: searchParams.get('sortNullsId') ?? '',
	};
};

export const MhicSortDropdown = ({ align, className }: MhicSortDropdownProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const patientOrderSortColumnId = useMemo(() => searchParams.get('patientOrderSortColumnId') ?? '', [searchParams]);
	const sortDirectionId = useMemo(() => searchParams.get('sortDirectionId') ?? '', [searchParams]);

	const classes = useStyles();
	const [show, setShow] = useState(false);
	const [sortByValue, setSortByValue] = useState('');
	const [orderValue, setOrderValue] = useState(SortDirectionId.ASCENDING);

	const sortByOptions = useMemo(
		() => [
			{
				value: PatientOrderSortColumnId.ORDER_DATE,
				title: 'Referral Date',
			},
			{
				value: PatientOrderSortColumnId.PRACTICE,
				title: 'Practice',
			},
			{
				value: PatientOrderSortColumnId.INSURANCE,
				title: 'Insurance',
			},
			{
				value: PatientOrderSortColumnId.OUTREACH_NUMBER,
				title: 'Outreach #',
			},
			{
				value: PatientOrderSortColumnId.MOST_RECENT_OUTREACH_DATE_TIME,
				title: 'Last Outreach Date',
			},
			{
				value: PatientOrderSortColumnId.MOST_RECENT_SCREENING_SESSION_COMPLETED_AT,
				title: 'Assessment Completed Date',
			},
			{
				value: PatientOrderSortColumnId.EPISODE_CLOSED_AT,
				title: 'Episode Closed Date',
			},
			{
				value: PatientOrderSortColumnId.EPISODE_LENGTH,
				title: 'Episode Length',
			},
			{
				value: PatientOrderSortColumnId.NEXT_CONTACT_SCHEDULED_AT,
				title: 'Next Contact',
			},
		],
		[]
	);

	const orderOptions = useMemo(
		() => [
			{
				value: SortDirectionId.ASCENDING,
				title: 'Ascending',
			},
			{
				value: SortDirectionId.DESCENDING,
				title: 'Descending',
			},
		],
		[]
	);

	const handleApplyButtonClick = useCallback(() => {
		setShow(false);

		searchParams.set('patientOrderSortColumnId', sortByValue);
		searchParams.set('sortDirectionId', orderValue);
		searchParams.set('pageNumber', '0');

		setSearchParams(searchParams);
	}, [orderValue, searchParams, setSearchParams, sortByValue]);

	const handleClearButtonClick = useCallback(() => {
		setShow(false);

		searchParams.delete('patientOrderSortColumnId');
		searchParams.delete('sortDirectionId');
		searchParams.delete('sortNullsId');
		searchParams.set('pageNumber', '0');

		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const selectedSortByOption = useMemo(() => {
		const patientOrderSortColumnId = searchParams.get('patientOrderSortColumnId') ?? '';
		return sortByOptions.find((o) => o.value === patientOrderSortColumnId);
	}, [searchParams, sortByOptions]);

	useEffect(() => {
		setSortByValue(patientOrderSortColumnId);
	}, [patientOrderSortColumnId]);

	useEffect(() => {
		setOrderValue(sortDirectionId ? (sortDirectionId as SortDirectionId) : SortDirectionId.ASCENDING);
	}, [sortDirectionId]);

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
				<SortIcon className="me-2" />
				<span>Sort By{selectedSortByOption ? `: ${selectedSortByOption.title}` : ''}</span>
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
					<InputHelper
						className={classNames('me-2', classes.flex1)}
						as="select"
						label="Sort By"
						value={sortByValue}
						onChange={({ currentTarget }) => {
							setSortByValue(currentTarget.value);
						}}
					>
						<option value="" label="Select Sort By" disabled />
						{sortByOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.title}
							</option>
						))}
					</InputHelper>
					<InputHelper
						className={classNames('ms-2', classes.flex1)}
						as="select"
						label="Order"
						value={orderValue}
						onChange={({ currentTarget }) => {
							setOrderValue(currentTarget.value as SortDirectionId);
						}}
					>
						{orderOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.title}
							</option>
						))}
					</InputHelper>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button variant="outline-primary" size="sm" className="me-2" onClick={handleClearButtonClick}>
						Clear
					</Button>
					<Button variant="primary" size="sm" onClick={handleApplyButtonClick}>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
