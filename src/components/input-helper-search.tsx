import React from 'react';
import { Button, Form, FormControlProps } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { ReactComponent as CancelIcon } from '@/assets/icons/icon-cancel-fill.svg';

const useInputHelperSearchStyles = createUseThemedStyles((theme) => ({
	inputHelper: {
		width: '100%',
		position: 'relative',
		'&:focus-within': {
			'& svg': {
				fill: theme.colors.p500,
			},
		},
	},
	input: {
		height: 40,
		width: '100%',
		display: 'block',
		borderRadius: 500,
		appearance: 'none',
		padding: '9px 16px 9px 36px',
		...theme.fonts.default,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		'&:hover': {
			border: `1px solid ${theme.colors.border}`,
		},
		'&:focus': {
			outline: 'none',
			border: `1px solid ${theme.colors.p500}`,
		},
		'&:disabled': {
			backgroundColor: theme.colors.background,
		},
	},
	searchIcon: {
		left: 12,
		zIndex: 1,
		top: '50%',
		position: 'absolute',
		pointerEvents: 'none',
		fill: theme.colors.n300,
		transform: 'translateY(-50%)',
	},
	clearButton: {
		right: 10,
		zIndex: 1,
		top: '50%',
		padding: 0,
		position: 'absolute',
		color: theme.colors.n300,
		transform: 'translateY(-50%)',
		'&:hover': {
			color: theme.colors.n500,
		},
		'&:active': {
			color: theme.colors.n900,
		},
	},
}));

export interface InputHelperSearchProps extends FormControlProps {
	className?: string;
	autoFocus?: boolean;
	onClear(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const InputHelperSearch = React.forwardRef<HTMLInputElement, InputHelperSearchProps>(
	({ className, autoFocus, onClear, ...props }, ref) => {
		const classes = useInputHelperSearchStyles();

		return (
			<div className={className}>
				<Form.Group className={classNames(classes.inputHelper)}>
					<SearchIcon width={20} height={20} className={classes.searchIcon} />
					<Form.Control
						ref={ref}
						className={classes.input}
						bsPrefix="input-helper__input--search"
						type="search"
						autoFocus={autoFocus}
						{...props}
					/>
					{props.value && (
						<Button variant="link" className={classes.clearButton} onClick={onClear}>
							<CancelIcon width={22} height={22} />
						</Button>
					)}
				</Form.Group>
			</div>
		);
	}
);

export default InputHelperSearch;
