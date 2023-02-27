import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenu: {
		border: 0,
		width: 576,
		padding: 16,
		zIndex: 1000,
		display: 'none',
		borderRadius: 4,
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n0,
		'&.show': {
			display: 'block',
		},
	},
	freeformInput: {
		width: 328,
	},
}));

export const MhicSortDropdown = () => {
	const classes = useStyles();
	const [show, setShow] = useState(false);

	return (
		<Dropdown autoClose="outside" show={show} onToggle={setShow}>
			<Dropdown.Toggle className="me-2" variant="light" id="mhic-sort-toggle">
				Sort
			</Dropdown.Toggle>
			<Dropdown.Menu
				className={classes.dropdownMenu}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
				bsPrefix="mhic-sort-menu"
			>
				<div className="d-flex align-items-center mb-3">
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
				<div className="text-right">
					<Button
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
