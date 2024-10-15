import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-drop-down.svg';
import { ReactComponent as SortIcon } from '@/assets/icons/sort.svg';
import { useSearchParams } from 'react-router-dom';

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
	searchParamKey: string;
	options: T[];
	optionIdKey: keyof T;
	optionLabelKey: keyof T;
	width?: number;
	dismissText?: string;
	confirmText?: string;
	className?: string;
	isSortFilter?: boolean;
}

function FilterDropdownV2<T extends Option>({
	id,
	title,
	searchParamKey,
	options,
	optionIdKey,
	optionLabelKey,
	width = 400,
	dismissText = 'Clear',
	confirmText = 'Apply',
	className,
	isSortFilter,
}: FilterDropdownProps<T>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchParamValue = useMemo(() => searchParams.get(searchParamKey) ?? '', [searchParamKey, searchParams]);

	const classes = useStyles({ width });
	const [show, setShow] = useState(false);
	const [selectedValue, setSelectedValue] = useState('');

	const icon = isSortFilter ? <SortIcon /> : <ArrowDown />;

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={(nextShow) => {
				if (nextShow && searchParamValue) {
					setSelectedValue(searchParamValue);
				}

				setShow(nextShow);
			}}
		>
			<Dropdown.Toggle
				variant={!!searchParamValue ? 'primary' : 'light'}
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
							name={`filter-dropdown--${searchParamKey}`}
							id={`filter-dropdown--${option[optionIdKey]}`}
							value={option[optionIdKey]}
							label={option[optionLabelKey]}
							checked={selectedValue === option[optionIdKey]}
							onChange={({ currentTarget }) => {
								setSelectedValue(currentTarget.value);
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
							searchParams.delete(searchParamKey);
							setSearchParams(searchParams);
							setSelectedValue('');
							setShow(false);
						}}
					>
						{dismissText}
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							searchParams.set(searchParamKey, selectedValue);
							setSearchParams(searchParams);
							setShow(false);
						}}
					>
						{confirmText}
					</Button>
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
}

export default FilterDropdownV2;
