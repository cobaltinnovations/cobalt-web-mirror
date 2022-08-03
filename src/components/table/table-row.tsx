import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useTableRowStyles = createUseThemedStyles((theme) => ({
	tableRow: {
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
}));

interface TableRowProps extends PropsWithChildren {
	className?: string;
}

export const TableRow: FC<TableRowProps> = React.memo(({ className, children }) => {
	const classes = useTableRowStyles();

	return <tr className={classNames(classes.tableRow, className)}>{children}</tr>;
});
