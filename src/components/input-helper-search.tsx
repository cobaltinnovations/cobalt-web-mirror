import React from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import iconXCircle from '@/assets/icons/icon-x-circle.svg';

const useInputHelperSearchStyles = createUseThemedStyles((theme) => ({
	'@global': {
		'::-webkit-search-cancel-button': {
			width: 16,
			height: 16,
			cursor: 'pointer',
			appearance: 'none',
			borderRadius: '50%',
			maskSize: '24px 24px',
			maskPosition: 'center',
			maskRepeat: 'no-repeat',
			maskImage: `url(${iconXCircle})`,
			backgroundColor: theme.colors.n300,
		},
	},
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
		border: `1px solid ${theme.colors.n100}`,
		'&:hover': {
			border: `1px solid ${theme.colors.n300}`,
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
}));

interface InputHelperSearchProps extends FormControlProps {
	className?: string;
	autoFocus?: boolean;
}

const InputHelperSearch = ({ className, autoFocus, ...props }: InputHelperSearchProps) => {
	const classes = useInputHelperSearchStyles();

	return (
		<div className={className}>
			<Form.Group className={classNames(classes.inputHelper)}>
				<SearchIcon width={20} height={20} className={classes.searchIcon} />
				<Form.Control
					className={classes.input}
					bsPrefix="input-helper__input--search"
					type="search"
					autoFocus={autoFocus}
					{...props}
				/>
			</Form.Group>
		</div>
	);
};

export default InputHelperSearch;
