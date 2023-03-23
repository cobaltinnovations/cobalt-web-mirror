import React, { PropsWithChildren, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';

interface UseStylesProps {
	width: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenu: {
		width: '90%',
		padding: `0 !important`,
		maxWidth: ({ width }: UseStylesProps) => width,
	},
	dropdownMenuBody: {
		padding: '16px 24px',
		...theme.fonts.default,
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

interface FilterDropdownProps {
	id: string;
	title: string;
	active?: boolean;
	width?: number;
	dismissText?: string;
	confirmText?: string;
	onDismiss(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onConfirm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	className?: string;
}

const FilterDropdown = ({
	id,
	title,
	active = false,
	width = 400,
	dismissText = 'Cancel',
	confirmText = 'Apply',
	onDismiss,
	onConfirm,
	className,
	children,
}: PropsWithChildren<FilterDropdownProps>) => {
	const classes = useStyles({ width });
	const [show, setShow] = useState(false);

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={setShow}
		>
			<Dropdown.Toggle
				variant={active ? 'primary' : 'outline-primary'}
				as={DropdownToggle}
				className="d-inline-flex align-items-center pe-3"
				id={id}
			>
				<span>{title}</span>
				<ArrowDown className="ms-1" />
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				align="start"
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				className={classes.dropdownMenu}
				renderOnMount
			>
				<div className={classes.dropdownMenuBody}>{children}</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="outline-primary"
						size="sm"
						className="me-2"
						onClick={(event) => {
							setShow(false);
							onDismiss(event);
						}}
					>
						{dismissText}
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={(event) => {
							setShow(false);
							onConfirm(event);
						}}
					>
						{confirmText}
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default FilterDropdown;
