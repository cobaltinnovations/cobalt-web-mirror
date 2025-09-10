import React, { FC, PropsWithChildren } from 'react';
import { Form } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from './svg-icon';

interface UseStylesProps {
	disabled: boolean;
}

const useSelectStyles = createUseThemedStyles((theme) => ({
	select: {
		position: 'relative',
		'& select': {
			height: 54,
			...theme.fonts.default,
			width: '100%',
			borderRadius: 0,
			cursor: 'pointer',
			appearance: 'none',
			backgroundImage: 'none',
			color: theme.colors.n900,
			...theme.fonts.bodyNormal,
			padding: '0 40px 0 15px',
			backgroundColor: theme.colors.n0,
			border: `1px solid ${theme.colors.border}`,
			'&:hover': {
				border: `1px solid ${theme.colors.p500}`,
			},
			'&:disabled': {
				color: theme.colors.n500,
				backgroundColor: theme.colors.n75,
				border: `1px solid ${theme.colors.border}`,
				'&:hover': {
					color: theme.colors.n500,
					backgroundColor: theme.colors.n75,
					border: `1px solid ${theme.colors.border}`,
				},
			},
			'&:invalid': {
				fontStyle: 'italic',
				color: theme.colors.n500,
			},
			'&:focus': {
				outline: 'none',
			},
			'&::-ms-expand': {
				display: 'none',
			},
		},
	},
	downChevron: {
		right: 15,
		top: '50%',
		position: 'absolute',
		transform: 'translateY(-50%)',
		fill: ({ disabled }: UseStylesProps) => (disabled ? theme.colors.n500 : theme.colors.n900),
	},
}));

interface SelectProps extends PropsWithChildren {
	value: string;
	onChange(event: React.ChangeEvent<HTMLSelectElement>): void;
	required?: boolean;
	disabled?: boolean;
	name?: string;
	className?: string;
}

const Select: FC<SelectProps> = ({ className, ...props }) => {
	const classes = useSelectStyles({ disabled: !!props.disabled });

	function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
		props.onChange(event);
	}

	return (
		<div className={classNames(classes.select, className)}>
			<Form.Select
				name={props.name}
				value={props.value}
				onChange={handleOnChange}
				required={props.required}
				disabled={props.disabled}
			>
				{props.children}
			</Form.Select>
			<SvgIcon kit="far" icon="chevron-down" size={16} className={classes.downChevron} />
		</div>
	);
};

export default Select;
