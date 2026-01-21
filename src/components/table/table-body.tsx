import React, { FC, PropsWithChildren } from 'react';
import { createUseThemedStyles } from '@/jss/theme';

const useTableBodyStyles = createUseThemedStyles(() => ({
	tableBody: {
		backgroundColor: 'inherit',
	},
}));

export const TableBody: FC<PropsWithChildren> = React.memo(({ children }) => {
	const classes = useTableBodyStyles();
	return <tbody className={classes.tableBody}>{children}</tbody>;
});
