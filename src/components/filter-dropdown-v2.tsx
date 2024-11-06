import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
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

interface Option {
	[key: string]: any;
}

interface FilterDropdownProps<T extends Option> {
	id: string;
	title: string;
	options: T[];
	optionIdKey: keyof T;
	optionLabelKey: keyof T;
	width?: number;
	className?: string;
	isSortFilter?: boolean;
	onChange(value?: T): void;
	value?: T;
}

function FilterDropdownV2<T extends Option>({
	id,
	title,
	options,
	optionIdKey,
	optionLabelKey,
	width = 400,
	className,
	isSortFilter,
	onChange,
	value,
}: FilterDropdownProps<T>) {
	const classes = useStyles({ width });
	const [show, setShow] = useState(false);
	const [selectedValue, setSelectedValue] = useState<T>();
	const icon = isSortFilter ? <SortIcon /> : <ArrowDown />;

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={(nextShow) => {
				setSelectedValue(value);
				setShow(nextShow);
			}}
		>
			<Dropdown.Toggle
				variant={value ? 'primary' : 'light'}
				as={DropdownToggle}
				className={classNames('d-inline-flex align-items-center pe-3')}
				id={id}
			>
				<span>{title}</span>
				{<div className="ms-1">{icon}</div>}
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				className={classes.dropdownMenu}
				renderOnMount
			>
				<div className={classes.dropdownMenuBody}>
					{options.map((option) => (
						<Form.Check
							key={option[optionIdKey]}
							type="radio"
							name={`filter-dropdown--${id}`}
							id={`filter-dropdown--${option[optionIdKey]}`}
							value={option[optionIdKey]}
							label={option[optionLabelKey]}
							checked={selectedValue?.[optionIdKey] === option[optionIdKey]}
							onChange={() => {
								setSelectedValue(option);
							}}
						/>
					))}
				</div>
				<div className={classes.dropdownMenuFooter}>
					<Button
						variant="outline-primary"
						size="sm"
						className="me-2"
						onClick={() => {
							onChange();
							setShow(false);
						}}
					>
						Clear
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							onChange(selectedValue);
							setShow(false);
						}}
					>
						Apply
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
}

export default FilterDropdownV2;
