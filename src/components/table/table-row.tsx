import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useTableRowStyles = createUseThemedStyles((theme) => ({
	tableRow: {
		backgroundColor: 'inherit',
		borderBottom: `1px solid ${theme.colors.n100}`,
		'&:last-child': {
			borderBottom: 0,
		},
	},
}));

interface TableRowProps extends PropsWithChildren {
	className?: string;
}

export const TableRow: FC<TableRowProps> = React.memo(({ className, children }) => {
	const classes = useTableRowStyles();

	return <tr className={classNames(classes.tableRow, className)}>{children}</tr>;
});
