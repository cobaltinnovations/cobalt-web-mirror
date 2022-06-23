import React, { FC, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useTableStyles = createUseStyles({
	tableOuter: {
		width: '100%',
		overflowX: 'auto',
		backgroundColor: colors.white,
	},
	table: {
		width: '100%',
	},
});

interface TableProps extends PropsWithChildren {
	className?: string;
	style?: object;
}

export const Table: FC<TableProps> = React.memo(({ className, style, children }) => {
	const classes = useTableStyles();

	return (
		<div className={classNames(classes.tableOuter, className)} style={style}>
			<table className={classes.table}>{children}</table>
		</div>
	);
});
