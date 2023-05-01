import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	isLoading?: boolean;
}

const useTableStyles = createUseThemedStyles((theme) => ({
	tableOuter: {
		width: '100%',
		borderRadius: 4,
		overflowX: 'auto',
		overflowY: 'hidden',
		opacity: ({ isLoading }: UseStylesProps) => (isLoading ? 0.5 : 1),
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	table: {
		width: '100%',
		borderSpacing: 0,
		backgroundColor: 'inherit',
	},
}));

interface TableProps extends PropsWithChildren {
	isLoading?: boolean;
	className?: string;
	style?: object;
}

export const Table: FC<TableProps> = React.memo(({ isLoading, className, style, children }) => {
	const classes = useTableStyles({ isLoading });

	return (
		<div className={classNames(classes.tableOuter, className)} style={style}>
			<table className={classes.table}>{children}</table>
		</div>
	);
});
