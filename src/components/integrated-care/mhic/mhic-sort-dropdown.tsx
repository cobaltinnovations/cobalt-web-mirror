import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as SortIcon } from '@/assets/icons/sort.svg';

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
		borderTop: `1px solid ${theme.colors.n100}`,
	},
}));

interface MhicSortDropdownProps {
	onApply(selectedFilters: Record<string, string>): void;
	align?: AlignType;
	className?: string;
}

export const MhicSortDropdown = ({ onApply, align, className }: MhicSortDropdownProps) => {
	const classes = useStyles();
	const [show, setShow] = useState(false);

	const [sortByValue, setSortByValue] = useState('');
	const [orderValue, setOrderValue] = useState('');

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
				<span>Sort By</span>
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
						className="me-2 flex-grow-1"
						as="select"
						label="Sort By"
						value={sortByValue}
						onChange={({ currentTarget }) => {
							setSortByValue(currentTarget.value);
						}}
					>
						<option value="" label="Select Sort By" disabled />
						<option value="PRACTICE">Practice</option>
					</InputHelper>
					<InputHelper
						className="ms-2 flex-grow-1"
						as="select"
						label="Order"
						value={orderValue}
						onChange={({ currentTarget }) => {
							setOrderValue(currentTarget.value);
						}}
					>
						<option value="" label="Select Order" disabled />
						<option value="ASCENDING">Ascending</option>
						<option value="DESCENDING">Descending</option>
					</InputHelper>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							setShow(false);
							onApply({
								[sortByValue]: orderValue,
							});
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
