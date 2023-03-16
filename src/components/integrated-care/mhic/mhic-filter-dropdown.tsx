import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';

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
	className?: string;
}

export const MhicFilterDropdown = ({ className }: Props) => {
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
				className="d-inline-flex align-items-center py-2 ps-3 pe-4"
				id="order-filters--add-filter"
			>
				<FilterIcon className="me-2" />
				<span>Add Filter</span>
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				className="p-0"
				align="start"
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
			>
				<div className={classes.dropdownMenuBody}>
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
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Flag
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Practice
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Referral Reason
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Assessment Status
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Care Focus
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Resource Status
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									return;
								}}
							>
								Follow Up Response
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="outline-primary"
						size="sm"
						className="me-2"
						onClick={() => {
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
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
