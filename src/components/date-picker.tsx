import React, { FC, forwardRef } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

import unfoldIcon from '@/assets/icons/icon-unfold.svg';
import { createUseThemedStyles } from '@/jss/theme';
import moment from 'moment';

const useDatePickerStyles = createUseThemedStyles((theme) => ({
	datePickerWrapper: {
		width: '100%',
	},
	datePicker: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: 56,
		lineHeight: '4.2rem',
		textIndent: 0,
		paddingLeft: 15,
		paddingRight: 15,
		border: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n0,
		textAlign: 'left',
		'&:disabled': {
			backgroundColor: theme.colors.background,
		},
	},
}));

interface DatePickerProps extends ReactDatePickerProps {
	testId?: string;
	selected?: Date;
	disabled?: boolean;
	onChange: (value: Date | null) => void;
	wrapperClass?: string;
	labelText?: string;
}

const CustomDateInput = forwardRef(({ value, onClick, disabled, className, label, ...props }: any, ref: any) => {
	return (
		<button {...props} type="button" ref={ref} className={className} onClick={onClick} disabled={disabled}>
			{value || label || 'Select Date'}
			<img className="ms-auto" src={unfoldIcon} alt="Unfold Date Picker" />
		</button>
	);
});

const DatePicker: FC<DatePickerProps> = ({
	testId,
	selected,
	onChange,
	wrapperClass,
	labelText,
	...reactDatePickerProps
}) => {
	const classes = useDatePickerStyles();

	return (
		<ReactDatePicker
			renderDayContents={(dayOfMonth, date) => {
				return <span data-testid={`${testId}-${moment(date).format('YYYY-MM-DD')}`}>{dayOfMonth}</span>;
			}}
			wrapperClassName={`${classes.datePickerWrapper} ${wrapperClass}`}
			dateFormat="MMM d, yyyy"
			selected={selected}
			onChange={onChange}
			customInput={
				<CustomDateInput
					data-testid={testId}
					className={classes.datePicker}
					label={labelText}
					disabled={reactDatePickerProps.disabled}
				/>
			}
			{...reactDatePickerProps}
		/>
	);
};

export default DatePicker;
