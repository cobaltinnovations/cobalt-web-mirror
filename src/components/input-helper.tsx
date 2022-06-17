import React, { ElementType, FC, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

interface useInputHelperStylesProps {
	isHovered: boolean;
	isFocused: boolean;
	as?: ElementType<any> | undefined;
	value: string | number | string[] | undefined;
	hasError: boolean;
}

const useInputHelperStyles = createUseStyles({
	inputHelper: ({ as, isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: colors.white,
		height: as === 'textarea' ? 110 : 56,
		border: `1px solid ${hasError ? colors.danger : isHovered || isFocused ? colors.primary : colors.border}`,
	}),
	label: ({ isFocused, value, hasError }: useInputHelperStylesProps) => ({
		top: 18,
		left: 16,
		margin: 0,
		zIndex: 1,
		right: 'initial',
		position: 'absolute',
		pointerEvents: 'none',
		transformOrigin: 'left top',
		color: hasError ? colors.danger : isFocused ? colors.primary : colors.gray600,
		transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
		transform: isFocused || value ? 'translateY(-50%) scale(0.75)' : '',
	}),
	input: ({ as, value }: useInputHelperStylesProps) => ({
		margin: 0,
		border: 0,
		...fonts.xs,
		width: '100%',
		height: '100%',
		resize: 'none',
		borderRadius: 0,
		display: 'block',
		appearance: 'none',
		padding: as === 'textarea' ? '25px 16px 20px' : '20px 16px 6px',
		backgroundColor: 'transparent',
		'&:focus': {
			outline: 'none',
			boxShadow: 'none',
		},
		opacity: as === 'select' ? (value ? 1 : 0) : 1,
		'&:disabled': {
			backgroundColor: colors.background,
		},
	}),
	downChevron: ({ isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		zIndex: 1,
		right: 16,
		top: '50%',
		position: 'absolute',
		pointerEvents: 'none',
		transform: 'translateY(-50%)',
		fill: hasError ? colors.danger : isHovered || isFocused ? colors.primary : colors.black,
	}),
});

interface InputHelperProps extends FormControlProps {
	label: string;
	name?: string;
	onFocus?: (...args: any[]) => void;
	onBlur?: (...args: any[]) => void;
	className?: string;
	helperText?: string;
	characterCounter?: number;
	error?: string;
	required?: boolean;
}

const InputHelper: FC<InputHelperProps> = ({
	label,
	children,
	className,
	helperText,
	characterCounter,
	required,
	error,
	...props
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const classes = useInputHelperStyles({
		isHovered,
		isFocused,
		as: props.as,
		value: props.value,
		hasError: !!error,
	});

	function handleMouseOver() {
		if (props.disabled) {
			return;
		}

		setIsHovered(true);
	}

	function handleMouseOut() {
		setIsHovered(false);
	}

	function handleFocus(event: React.FocusEvent) {
		setIsFocused(true);

		if (props.onFocus) {
			props.onFocus(event);
		}
	}

	function handleBlur(event: React.FocusEvent) {
		setIsFocused(false);

		if (props.onBlur) {
			props.onBlur(event);
		}
	}

	return (
		<div className={className}>
			<Form.Group
				className={classNames('mb-0', classes.inputHelper)}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
			>
				<Form.Label className={classes.label} bsPrefix="input-helper__label">
					{label} {required && '*'}
				</Form.Label>
				<Form.Control
					className={classes.input}
					bsPrefix="input-helper__input"
					{...props}
					onFocus={handleFocus}
					onBlur={handleBlur}
				>
					{children}
				</Form.Control>
				{props.as === 'select' && <DownChevron className={classes.downChevron} />}
			</Form.Group>
			{(helperText || characterCounter) && (
				<div className="mt-2 pl-3 pr-3 d-flex justify-content-between">
					{helperText && <p className="mb-0 ml-0 mr-auto text-muted font-size-xxs">{helperText}</p>}
					{characterCounter && (
						<p className="mb-0 ml-auto mr-0 text-muted font-size-xxs">
							{props.value ? (props.value as string | string[]).length : 0} / {characterCounter}
						</p>
					)}
				</div>
			)}
			{error && (
				<div className="mt-2 pl-3 pr-3 d-flex justify-content-between">
					<p className="mb-0 ml-0 mr-auto text-danger font-size-xxs">{error}</p>
				</div>
			)}
		</div>
	);
};

export default InputHelper;
