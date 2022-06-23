import React, { FC, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useTableRowStyles = createUseStyles({
	tableRow: {
		backgroundColor: colors.white,
		borderBottom: `1px solid ${colors.border}`,
	},
});

interface TableRowProps extends PropsWithChildren {
	className?: string;
}

export const TableRow: FC<TableRowProps> = React.memo(({ className, children }) => {
	const classes = useTableRowStyles();

	return <tr className={classNames(classes.tableRow, className)}>{children}</tr>;
});
