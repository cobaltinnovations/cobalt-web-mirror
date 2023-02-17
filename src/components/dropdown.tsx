import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { RefObject } from 'react';
import { Button } from 'react-bootstrap';
import { DropdownMenuProps } from 'react-bootstrap/esm/DropdownMenu';
import { DropdownToggleProps } from 'react-bootstrap/esm/DropdownToggle';

export const DropdownToggle = React.forwardRef(
	(
		{ children, style, onClick }: DropdownToggleProps,
		ref: ((instance: HTMLButtonElement | null) => void) | RefObject<HTMLButtonElement> | null | undefined
	) => {
		return (
			<Button ref={ref} variant="light" style={style} className={'p-2'} onClick={onClick}>
				{children}
			</Button>
		);
	}
);

const useDropdownMenuStyles = createUseThemedStyles(
	(theme) => ({
		dropdownMenu: {
			minWidth: 176,
			padding: '8px 0',
			// boxShadow: theme.elevation.e400,
			backgroundColor: theme.colors.n0,
			border: `1px solid ${theme.colors.n100}`,
			'& .dropdown-item': {
				padding: '10px 20px',
				...theme.fonts.default,
				color: theme.colors.n900,
				'&:hover, &:focus': {
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					backgroundColor: theme.colors.n75,
				},
			},
		},
	}),
	{ index: 2 }
);

export const DropdownMenu = React.forwardRef(
	(
		{ children, style, className, 'aria-labelledby': labeledBy }: DropdownMenuProps,
		ref: React.LegacyRef<HTMLDivElement> | undefined
	) => {
		const classes = useDropdownMenuStyles();

		return (
			<div
				ref={ref}
				style={style}
				className={classNames(classes.dropdownMenu, className)}
				aria-labelledby={labeledBy}
			>
				{children}
			</div>
		);
	}
);
