import React, { ElementType, FC, PropsWithChildren, useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import classNames from 'classnames';

import { ReactComponent as SelectIcon } from '@/assets/icons/icon-select.svg';
import { createUseThemedStyles } from '@/jss/theme';

interface useInputHelperStylesProps {
	isHovered: boolean;
	isFocused: boolean;
	as?: ElementType<any> | undefined;
	value: string | number | string[] | undefined;
	hasError: boolean;
}

const useInputHelperStyles = createUseThemedStyles((theme) => ({
	inputHelper: ({ as, isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		borderRadius: 5,
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		height: as === 'textarea' ? 130 : 54,
		border: `1px solid ${
			hasError
				? theme.colors.d500
				: isFocused
				? theme.colors.p500
				: isHovered
				? theme.colors.n300
				: theme.colors.n100
		}`,
	}),
	label: ({ isFocused, value, hasError }: useInputHelperStylesProps) => ({
		top: 16,
		left: 16,
		margin: 0,
		zIndex: 1,
		right: 'initial',
		position: 'absolute',
		pointerEvents: 'none',
		...theme.fonts.headingBold,
		transformOrigin: 'left top',
		color: hasError ? theme.colors.d500 : isFocused ? theme.colors.p500 : theme.colors.n500,
		transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
		transform: isFocused || value ? 'translateY(-50%) scale(0.75)' : '',
	}),
	input: ({ as, value }: useInputHelperStylesProps) => ({
		margin: 0,
		border: 0,
		...theme.fonts.default,
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
			backgroundColor: theme.colors.background,
		},
	}),
	downChevron: ({ isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		zIndex: 1,
		right: 16,
		top: '50%',
		position: 'absolute',
		pointerEvents: 'none',
		transform: 'translateY(-50%)',
		fill: hasError
			? theme.colors.d500
			: isFocused
			? theme.colors.p500
			: isHovered
			? theme.colors.n500
			: theme.colors.n500,
	}),
}));

interface InputHelperProps extends FormControlProps, PropsWithChildren {
	label: string;
	name?: string;
	onFocus?: (...args: any[]) => void;
	onBlur?: (...args: any[]) => void;
	className?: string;
	helperText?: string;
	characterCounter?: number;
	error?: string;
	required?: boolean;
	autoFocus?: boolean;
}

const InputHelper = React.forwardRef<HTMLInputElement, InputHelperProps>(
	({ label, children, className, helperText, characterCounter, required, error, autoFocus, ...props }, ref) => {
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

		const FormControlComponent = props.as === 'select' ? Form.Select : Form.Control;

		return (
			<div className={className}>
				<Form.Group
					className={classNames(classes.inputHelper)}
					onMouseOver={handleMouseOver}
					onMouseOut={handleMouseOut}
				>
					<Form.Label className={classes.label} bsPrefix="input-helper__label">
						{label} {required && <span className="text-danger">*</span>}
					</Form.Label>
					{/* @ts-expect-error Bootstrap 5 vs bootstrap 4 onChange type */}
					<FormControlComponent
						className={classes.input}
						bsPrefix="input-helper__input"
						{...props}
						onFocus={handleFocus}
						onBlur={handleBlur}
						autoFocus={autoFocus}
						required={required}
						ref={ref}
					>
						{children}
					</FormControlComponent>
					{props.as === 'select' && <SelectIcon className={classes.downChevron} />}
				</Form.Group>
				{(helperText || characterCounter) && (
					<div className="mt-2 ps-3 pe-3 d-flex justify-content-between">
						{helperText && <p className="mb-0 ms-0 me-auto text-muted fs-small">{helperText}</p>}
						{characterCounter && (
							<p className="mb-0 ms-auto me-0 text-muted fs-small">
								{props.value ? (props.value as string | string[]).length : 0} / {characterCounter}
							</p>
						)}
					</div>
				)}
				{error && (
					<div className="mt-2 ps-3 pe-3 d-flex justify-content-between">
						<p className="mb-0 ms-0 me-auto text-danger fs-small">{error}</p>
					</div>
				)}
			</div>
		);
	}
);

export default InputHelper;
