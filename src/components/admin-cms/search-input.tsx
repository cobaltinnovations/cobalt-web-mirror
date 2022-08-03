import React, { FC } from 'react';
import { Form } from 'react-bootstrap';

import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	searchIcon: {
		top: '50%',
		right: 16,
		position: 'absolute',
		pointerEvents: 'none',
		fill: theme.colors.a500,
		transform: 'translateY(-50%)',
	},
}));

interface SearchInputProps {
	value: string;
	onChange(event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void;
}

const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => {
	const classes = useStyles();

	return (
		<div className="position-relative">
			<Form.Control type="search" placeholder="Search" value={value} onChange={onChange} />
			<SearchIcon className={classes.searchIcon} />
		</div>
	);
};

export default SearchInput;
