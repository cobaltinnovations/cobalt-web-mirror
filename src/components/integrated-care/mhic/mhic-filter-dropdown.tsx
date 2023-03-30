import React, { useCallback, useState } from 'react';
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
	onApply(selectedFilters: Record<string, string>): void;
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

export const MhicFilterDropdown = ({ onApply, align, className }: Props) => {
	const classes = useStyles();
	const [show, setShow] = useState(false);

	const [availableFilters] = useState<Filter[]>([
		{
			filterId: 'FLAG',
			title: 'Flag',
			options: [
				{
					title: 'Option 1',
					value: 'FLAG_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'FLAG_OPTION_2',
				},
			],
		},
		{
			filterId: 'PRACTICE',
			title: 'Practice',
			options: [
				{
					title: 'Option 1',
					value: 'PRACTICE_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'PRACTICE_OPTION_2',
				},
			],
		},
		{
			filterId: 'REFERRAL_REASON',
			title: 'Referral Reason',
			options: [
				{
					title: 'Option 1',
					value: 'REFERRAL_REASON_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'REFERRAL_REASON_OPTION_2',
				},
			],
		},
		{
			filterId: 'ASSESSMENT_STATUS',
			title: 'Assessment Status',
			options: [
				{
					title: 'Option 1',
					value: 'ASSESSMENT_STATUS_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'ASSESSMENT_STATUS_OPTION_2',
				},
			],
		},
		{
			filterId: 'RESOURCE_STATUS',
			title: 'Resource Status',
			options: [
				{
					title: 'Option 1',
					value: 'RESOURCE_STATUS_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'RESOURCE_STATUS_OPTION_2',
				},
			],
		},
		{
			filterId: 'RESOURCE_CHECK_IN_RESPONSE',
			title: 'Resource Check-In Response',
			options: [
				{
					title: 'Option 1',
					value: 'RESOURCE_CHECK_IN_RESPONSE_OPTION_1',
				},
				{
					title: 'Option 2',
					value: 'RESOURCE_CHECK_IN_RESPONSE_OPTION_2',
				},
			],
		},
	]);

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

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={setShow}
		>
			<Dropdown.Toggle
				as={DropdownToggle}
				className="d-inline-flex align-items-center py-2 ps-3 pe-4"
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
							className="d-inline-flex align-items-center py-2 px-3"
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
						}}
					>
						Clear All
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							setShow(false);
							onApply(selectedFilters);
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
