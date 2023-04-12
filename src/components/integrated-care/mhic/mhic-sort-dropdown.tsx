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
	align?: AlignType;
	className?: string;
}

export const MhicSortDropdown = ({ align, className }: MhicSortDropdownProps) => {
	const classes = useStyles();
	const [show, setShow] = useState(false);

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
						label="Sorted By"
						value=""
						onChange={() => {
							return;
						}}
					>
						<option value="">Practice</option>
					</InputHelper>
					<InputHelper
						className="ms-2 flex-grow-1"
						as="select"
						label="Order"
						value=""
						onChange={() => {
							return;
						}}
					>
						<option value="">Ascending</option>
						<option value="">Descending</option>
					</InputHelper>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							setShow(false);
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
