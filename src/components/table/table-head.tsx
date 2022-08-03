import React, { FC, PropsWithChildren } from 'react';
import { createUseThemedStyles } from '@/jss/theme';

const useTableHeadStyles = createUseThemedStyles((theme) => ({
	tableHead: {
		border: `1px solid ${theme.colors.border}`,
		'& tr': {
			backgroundColor: theme.colors.n0,
		},
	},
}));

export const TableHead: FC<PropsWithChildren> = React.memo((props) => {
	const classes = useTableHeadStyles();

	return <thead className={classes.tableHead}>{props.children}</thead>;
});
