import React, { PropsWithChildren, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-drop-down.svg';
import { ReactComponent as SortIcon } from '@/assets/icons/sort.svg';

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
		maxHeight: 400,
		overflow: 'scroll',
		padding: '16px 24px',
		...theme.fonts.default,
		'& .react-datepicker': {
			boxShadow: 'none',
			'&__header': {
				backgroundColor: 'transparent',
			},
			'&__current-month, &__day-name': {
				color: theme.colors.n900,
			},
			'&__navigation': {
				'&:hover': {
					color: theme.colors.n900,
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					color: theme.colors.n900,
					backgroundColor: theme.colors.n75,
				},
			},
			'&__navigation-icon:before': {
				borderColor: theme.colors.n500,
			},
		},
	},
	dropdownMenuFooter: {
		textAlign: 'right',
		padding: '12px 16px',
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		backgroundColor: theme.colors.n50,
		borderTop: `1px solid ${theme.colors.border}`,
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
	onShow?(): void;
	onHide?(): void;
	className?: string;
	showSortIcon?: boolean;
	iconLeft?: boolean;
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
	onShow,
	onHide,
	className,
	showSortIcon = false,
	iconLeft = false,
	children,
}: PropsWithChildren<FilterDropdownProps>) => {
	const classes = useStyles({ width });
	const [show, setShow] = useState(false);

	const icon = showSortIcon ? <SortIcon /> : <ArrowDown />;

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={(nextShow) => {
				if (!nextShow) {
					onHide?.();
				} else {
					onShow?.();
				}

				setShow(nextShow);
			}}
		>
			<Dropdown.Toggle
				variant={active ? 'primary' : 'light'}
				as={DropdownToggle}
				className={classNames('d-inline-flex align-items-center', {
					'pe-3': !iconLeft,
					'ps-3': iconLeft,
				})}
				id={id}
			>
				{iconLeft && <div className="me-1">{icon}</div>}
				<span>{title}</span>
				{!iconLeft && <div className="ms-1">{icon}</div>}
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
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
