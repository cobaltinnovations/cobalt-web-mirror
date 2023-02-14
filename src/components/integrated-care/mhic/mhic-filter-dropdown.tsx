import React from 'react';
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

export const MhicFilterDropdown = () => {
	const classes = useStyles();

	return (
		<Dropdown>
			<Dropdown.Toggle className="me-2" variant="light" id="mhic-filter-toggle">
				Filter
			</Dropdown.Toggle>
			<Dropdown.Menu
				className={classes.dropdownMenu}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
				bsPrefix="mhic-filter-menu"
			>
				<div className="d-flex align-items-center mb-3">
					<InputHelper
						className="me-4 flex-grow-1"
						as="select"
						label="Filter"
						value=""
						onChange={() => {
							return;
						}}
					>
						<option value="">Practice</option>
					</InputHelper>
					<InputHelper
						className={classes.freeformInput}
						type="text"
						label="Practice"
						value=""
						onChange={() => {
							return;
						}}
					/>
				</div>
				<div className="text-right">
					<Button>Apply</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};
