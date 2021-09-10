import React, { ReactElement, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Typeahead, TypeaheadModel, TypeaheadProps } from 'react-bootstrap-typeahead';

import colors from '@/jss/colors';
import { Form } from 'react-bootstrap';
import classNames from 'classnames';

interface useInputHelperStylesProps {
	isHovered: boolean;
	isFocused: boolean;
	value: string;
	hasError: boolean;
}

const useStyles = createUseStyles({
	typeaheadHelper: ({ isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		position: 'relative',
		minHeight: 56,
		backgroundColor: colors.white,
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
});

interface TypeaheadHelperProps<T extends TypeaheadModel> extends TypeaheadProps<T> {
	label: string;
	required?: boolean;
	error?: string;
	helperText?: string;
	characterCounter?: number;
	className?: string;
}

export function TypeaheadHelper<T extends TypeaheadModel>({
	label,
	required,
	error,
	helperText,
	characterCounter,
	className,
	...props
}: TypeaheadHelperProps<T>): ReactElement {
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const classes = useStyles({
		isHovered,
		isFocused,
		value: !!props.selected?.length,
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

	function handleFocus(event: Event) {
		setIsFocused(true);

		if (props.onFocus) {
			props.onFocus(event);
		}
	}

	function handleBlur(event: Event) {
		setIsFocused(false);

		if (props.onBlur) {
			props.onBlur(event);
		}
	}

	return (
		<div className={classNames('typeahead-helper', className)}>
			<Form.Group className={classNames('mb-0', classes.typeaheadHelper)} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
				<Form.Label className={classes.label} bsPrefix="input-helper__label">
					{label} {required && '*'}
				</Form.Label>
				<Typeahead onFocus={handleFocus} onBlur={handleBlur} {...props} />
			</Form.Group>
			{(helperText || characterCounter) && (
				<div className="mt-2 pl-3 pr-3 d-flex justify-content-between">
					{helperText && <p className="mb-0 ml-0 mr-auto text-muted font-size-xxs">{helperText}</p>}
					{characterCounter && (
						<p className="mb-0 ml-auto mr-0 text-muted font-size-xxs">
							{props.selected ? props.selected.length : 0} / {characterCounter}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
