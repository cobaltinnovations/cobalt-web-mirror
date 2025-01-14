import React, { ReactElement, useCallback, useState } from 'react';
import { AsyncTypeahead, Typeahead } from 'react-bootstrap-typeahead';
import { TypeaheadComponentProps } from 'react-bootstrap-typeahead/types/components/Typeahead';

import { Form } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import useHandleError from '@/hooks/use-handle-error';

interface UseStylesProps {
	isHovered: boolean;
	isFocused: boolean;
	hasValue: boolean;
	hasError: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	typeaheadHelper: {
		minHeight: 54,
		borderRadius: 8,
		position: 'relative',
		backgroundColor: theme.colors.n0,
		border: ({ isHovered, isFocused, hasError }: UseStylesProps) =>
			`1px solid ${
				hasError
					? theme.colors.d500
					: isFocused
					? theme.colors.p500
					: isHovered
					? theme.colors.n300
					: theme.colors.n100
			}`,
	},
	label: {
		top: 18,
		left: 16,
		margin: 0,
		zIndex: 1,
		right: 'initial',
		position: 'absolute',
		pointerEvents: 'none',
		...theme.fonts.default,
		...theme.fonts.headingBold,
		transformOrigin: 'left top',
		color: ({ isFocused, hasError }: UseStylesProps) =>
			hasError ? theme.colors.d500 : isFocused ? theme.colors.p500 : theme.colors.n500,
		transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
		transform: ({ isFocused, hasValue }: UseStylesProps) =>
			isFocused || hasValue ? 'translateY(-50%) scale(0.75)' : '',
	},
}));

interface TypeaheadHelperProps<T> extends TypeaheadComponentProps {
	label: string;
	required?: boolean;
	error?: string;
	helperText?: string;
	characterCounter?: number;
	className?: string;
	fetchData?(query: string): Promise<T>;
	onFetchResolve?(response: T): void;
}

export function TypeaheadHelper<T>({
	label,
	required,
	error,
	helperText,
	characterCounter,
	className,
	fetchData,
	onFetchResolve,
	...props
}: TypeaheadHelperProps<T>): ReactElement {
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const handleError = useHandleError();

	const classes = useStyles({
		isHovered,
		isFocused,
		hasValue: !!props.selected?.length,
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

	const handleOnSearch = useCallback(
		async (query: string) => {
			if (!fetchData || !onFetchResolve) {
				return;
			}

			try {
				setIsLoading(true);
				const response = await fetchData(query);
				onFetchResolve(response);
			} catch (error) {
				handleError(error);
			} finally {
				setIsLoading(false);
			}
		},
		[fetchData, handleError, onFetchResolve]
	);

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
				{fetchData ? (
					<AsyncTypeahead
						isLoading={isLoading}
						onSearch={handleOnSearch}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...props}
					/>
				) : (
					<Typeahead onFocus={handleFocus} onBlur={handleBlur} {...props} />
				)}
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
