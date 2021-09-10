import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import colors from '@/jss/colors';

const useStyles = createUseStyles({
	searchIcon: {
		top: '50%',
		right: 16,
		position: 'absolute',
		pointerEvents: 'none',
		fill: colors.secondary,
		transform: 'translateY(-50%)',
	},
});

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
