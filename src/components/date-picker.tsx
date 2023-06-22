import React, { FC, forwardRef } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { createUseThemedStyles } from '@/jss/theme';
import moment from 'moment';

interface UseStylesProps {
	value: boolean;
}

const useDatePickerStyles = createUseThemedStyles((theme) => ({
	datePickerWrapper: {
		width: '100%',
	},
	datePicker: {
		height: 54,
		width: '100%',
		textAlign: 'left',
		textIndent: 0,
		borderRadius: 5,
		position: 'relative',
		padding: '20px 16px 6px',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		'&:hover': {
			borderColor: theme.colors.n300,
		},
		'&:disabled': {
			backgroundColor: theme.colors.background,
		},
		'& .date-picker-label': {
			top: 16,
			left: 16,
			margin: 0,
			zIndex: 1,
			right: 'initial',
			position: 'absolute',
			color: theme.colors.n500,
			...theme.fonts.default,
			...theme.fonts.headingBold,
			transformOrigin: 'left top',
			transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
			transform: ({ value }: UseStylesProps) => (value ? 'translateY(-50%) scale(0.75)' : ''),
		},
		'& .date-picker-value': {
			...theme.fonts.default,
			color: theme.colors.n900,
		},
		'& .date-picker-icon': {
			zIndex: 1,
			right: 16,
			top: '50%',
			position: 'absolute',
			pointerEvents: 'none',
			color: theme.colors.n300,
			transform: 'translateY(-50%)',
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

const CustomDateInput = forwardRef(
	(
		{ value, onClick, disabled, required, className, label, ...props }: any,
		ref: React.LegacyRef<HTMLButtonElement> | undefined
	) => {
		return (
			<button {...props} type="button" ref={ref} className={className} onClick={onClick} disabled={disabled}>
				{label ? (
					<span className="date-picker-label">
						{label} {required && <span className="text-danger">*</span>}
					</span>
				) : (
					<span className="date-picker-label">
						Select Date {required && <span className="text-danger">*</span>}
					</span>
				)}
				<span className="date-picker-value">{value}</span>
				<CalendarIcon className="date-picker-icon" />
			</button>
		);
	}
);

const DatePicker: FC<DatePickerProps> = ({
	testId,
	selected,
	onChange,
	wrapperClass,
	labelText,
	...reactDatePickerProps
}) => {
	const classes = useDatePickerStyles({
		value: !!selected,
	});

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
					required={reactDatePickerProps.required}
				/>
			}
			{...reactDatePickerProps}
		/>
	);
};

export default DatePicker;
