import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { RefObject, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { DropdownMenuProps } from 'react-bootstrap/esm/DropdownMenu';
import { DropdownToggleProps } from 'react-bootstrap/esm/DropdownToggle';

export const DropdownToggle = React.forwardRef(
	(
		{ variant, className, children, style, onClick, disabled }: DropdownToggleProps,
		ref: ((instance: HTMLButtonElement | null) => void) | RefObject<HTMLButtonElement> | null | undefined
	) => {
		const classNameProp = useMemo(() => (className ?? '').replace('dropdown-toggle', ''), [className]);

		return (
			<Button
				ref={ref}
				variant={variant ?? 'light'}
				className={classNames(classNameProp)}
				style={style}
				onClick={onClick}
				disabled={disabled}
			>
				{children}
			</Button>
		);
	}
);

const useDropdownMenuStyles = createUseThemedStyles((theme) => ({
	dropdownMenu: {
		border: 0,
		padding: 16,
		minWidth: 176,
		marginTop: 8,
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
		'& .dropdown-item': {
			padding: 12,
			borderRadius: 4,
			...theme.fonts.default,
			color: theme.colors.n900,
			'&:hover, &:focus': {
				backgroundColor: theme.colors.n50,
			},
			'&:active': {
				backgroundColor: theme.colors.n75,
			},
		},
		'& .dropdown-divider': {
			margin: '16px 0',
			borderColor: theme.colors.border,
		},
	},
	compact: {
		padding: '8px 0',
		borderRadius: 4,
		'& .dropdown-item': {
			padding: '8px 16px',
		},
		'& .dropdown-divider': {
			margin: '8px 0',
		},
	},
}));

export const DropdownMenu = React.forwardRef(
	(
		{
			children,
			style,
			className,
			'aria-labelledby': labeledBy,
			compact = false,
		}: DropdownMenuProps & { compact?: boolean },
		ref: React.LegacyRef<HTMLDivElement> | undefined
	) => {
		const classes = useDropdownMenuStyles();

		return (
			<div
				ref={ref}
				style={style}
				className={classNames(classes.dropdownMenu, className, { [classes.compact]: compact })}
				aria-labelledby={labeledBy}
			>
				{children}
			</div>
		);
	}
);
