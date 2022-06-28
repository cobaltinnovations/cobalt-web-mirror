import React, { FC, PropsWithChildren } from 'react';
import { Form } from 'react-bootstrap';
import classNames from 'classnames';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useSelectStyles = createUseThemedStyles((theme) => ({
	select: {
		position: 'relative',
		'& select': {
			height: 54,
			...theme.fonts.xs,
			width: '100%',
			borderRadius: 0,
			cursor: 'pointer',
			appearance: 'none',
			color: theme.colors.dark,
			...theme.fonts.secondaryRegular,
			padding: '0 40px 0 15px',
			backgroundColor: theme.colors.white,
			border: `1px solid ${theme.colors.border}`,
			'&:hover': {
				border: `1px solid ${theme.colors.primary}`,
			},
			'&:disabled': {
				color: theme.colors.gray500,
				backgroundColor: theme.colors.gray200,
				border: `1px solid ${theme.colors.gray200}`,
				'&:hover': {
					color: theme.colors.gray500,
					backgroundColor: theme.colors.gray200,
					border: `1px solid ${theme.colors.gray200}`,
				},
			},
			'&:invalid': {
				fontStyle: 'italic',
				color: theme.colors.gray600,
			},
			'&:focus': {
				outline: 'none',
			},
			'&::-ms-expand': {
				display: 'none',
			},
		},
	},
	downChevron: (props: any) => ({
		right: 15,
		top: '50%',
		position: 'absolute',
		transform: 'translateY(-50%)',
		fill: props.disabled ? theme.colors.gray500 : theme.colors.black,
	}),
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
	const classes = useSelectStyles({ disabled: props.disabled });

	function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
		props.onChange(event);
	}

	return (
		<div className={classNames(classes.select, className)}>
			<Form.Control
				as="select"
				name={props.name}
				value={props.value}
				onChange={handleOnChange}
				required={props.required}
				disabled={props.disabled}
			>
				{props.children}
			</Form.Control>
			<DownChevron className={classes.downChevron} />
		</div>
	);
};

export default Select;
