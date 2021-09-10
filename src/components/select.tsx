import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

const useSelectStyles = createUseStyles({
	select: {
		position: 'relative',
		'& select': {
			height: 54,
			...fonts.xs,
			width: '100%',
			borderRadius: 0,
			cursor: 'pointer',
			appearance: 'none',
			color: colors.dark,
			...fonts.karlaRegular,
			padding: '0 40px 0 15px',
			backgroundColor: colors.white,
			border: `1px solid ${colors.border}`,
			'&:hover': {
				border: `1px solid ${colors.primary}`,
			},
			'&:disabled': {
				color: colors.gray500,
				backgroundColor: colors.gray200,
				border: `1px solid ${colors.gray200}`,
				'&:hover': {
					color: colors.gray500,
					backgroundColor: colors.gray200,
					border: `1px solid ${colors.gray200}`,
				},
			},
			'&:invalid': {
				fontStyle: 'italic',
				color: colors.gray600,
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
		fill: props.disabled ? colors.gray500 : colors.black,
	}),
});

interface SelectProps {
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
