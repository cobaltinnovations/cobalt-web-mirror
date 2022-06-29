import React, { ReactElement, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { TypeaheadComponentProps } from 'react-bootstrap-typeahead/types/components/Typeahead';

import { Form } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface useInputHelperStylesProps {
	isHovered: boolean;
	isFocused: boolean;
	value: boolean;
	hasError: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	typeaheadHelper: ({ isHovered, isFocused, hasError }: useInputHelperStylesProps) => ({
		position: 'relative',
		minHeight: 56,
		backgroundColor: theme.colors.white,
		border: `1px solid ${
			hasError ? theme.colors.danger : isHovered || isFocused ? theme.colors.primary : theme.colors.border
		}`,
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
		color: hasError ? theme.colors.danger : isFocused ? theme.colors.primary : theme.colors.gray600,
		transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
		transform: isFocused || value ? 'translateY(-50%) scale(0.75)' : '',
	}),
}));

interface TypeaheadHelperProps extends TypeaheadComponentProps {
	label: string;
	required?: boolean;
	error?: string;
	helperText?: string;
	characterCounter?: number;
	className?: string;
}

export function TypeaheadHelper({
	label,
	required,
	error,
	helperText,
	characterCounter,
	className,
	...props
}: TypeaheadHelperProps): ReactElement {
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

	function handleFocus(event: React.SyntheticEvent<HTMLInputElement, Event>) {
		setIsFocused(true);

		if (props.onFocus) {
			props.onFocus(event);
		}
	}

	function handleBlur(event: React.FocusEvent<HTMLInputElement, Element>) {
		setIsFocused(false);

		if (props.onBlur) {
			props.onBlur(event);
		}
	}

	return (
		<div className={classNames('typeahead-helper', className)}>
			<Form.Group
				className={classNames('mb-0', classes.typeaheadHelper)}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
			>
				<Form.Label className={classes.label} bsPrefix="input-helper__label">
					{label} {required && '*'}
				</Form.Label>
				<Typeahead onFocus={handleFocus} onBlur={handleBlur} {...props} />
			</Form.Group>
			{(helperText || characterCounter) && (
				<div className="mt-2 ps-3 pe-3 d-flex justify-content-between">
					{helperText && <p className="mb-0 ms-0 me-auto text-muted fs-small">{helperText}</p>}
					{characterCounter && (
						<p className="mb-0 ms-auto me-0 text-muted fs-small">
							{props.selected ? props.selected.length : 0} / {characterCounter}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
