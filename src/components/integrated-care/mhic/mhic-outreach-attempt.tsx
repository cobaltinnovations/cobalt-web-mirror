import { v4 as uuidv4 } from 'uuid';
import React, { useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';

const useStyles = createUseThemedStyles((theme) => ({
	outreachAttempt: {
		padding: 16,
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
}));

interface Props {
	name: string;
	date: string;
	message: string;
	onEdit(): void;
	onDelete(): void;
	className?: string;
}

export const MhicOutreachAttempt = ({ name, date, message, onEdit, onDelete, className }: Props) => {
	const classes = useStyles();
	const uuid = useRef(uuidv4());

	return (
		<div className={classNames(classes.outreachAttempt, className)}>
			<div className="d-flex align-items-center justify-content-between">
				<p className="m-0 fw-bold">
					{name}
					<span className="ms-2 fw-normal text-gray">{date}</span>
				</p>
				<Dropdown>
					<Dropdown.Toggle as={DropdownToggle} id={`mhic-outreach-attempt__dropdown-menu--${uuid.current}`}>
						<MoreIcon className="d-flex" />
					</Dropdown.Toggle>
					<Dropdown.Menu
						as={DropdownMenu}
						align="end"
						flip={false}
						popperConfig={{ strategy: 'fixed' }}
						renderOnMount
					>
						<Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
						<Dropdown.Item onClick={onDelete}>
							<span className="text-danger">Delete</span>
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>
			<p className="m-0">{message}</p>
		</div>
	);
};
