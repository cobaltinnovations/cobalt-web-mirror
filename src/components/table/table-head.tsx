import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';

const useTableHeadStyles = createUseStyles({
	tableHead: {
		border: `1px solid ${colors.border}`,
		'& tr': {
			backgroundColor: colors.white,
		},
	},
});

export const TableHead: FC = React.memo((props) => {
	const classes = useTableHeadStyles();

	return <thead className={classes.tableHead}>{props.children}</thead>;
});
