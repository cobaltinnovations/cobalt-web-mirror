import React, { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { SORT_DIRECTION } from '.';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	header?: boolean;
	width?: string | number;
	sticky?: boolean;
	stickyBorder?: boolean;
	stickyOffset?: string | number;
	sortable?: boolean;
}

const useTableCellStyles = createUseThemedStyles((theme) => ({
	tableCell: {
		height: 1, // Don't worry, this is ignored by the browser. It's a hack to allow a 100% height inner <div/>
		padding: 0,
		width: ({ width }: UseStylesProps) => width ?? 'auto',
		backgroundColor: ({ header }: UseStylesProps) => (header ? theme.colors.n75 : 'inherit'),
		position: ({ sticky }: UseStylesProps) => (sticky ? 'sticky' : undefined),
		left: ({ sticky, stickyOffset }: UseStylesProps) => (sticky ? stickyOffset ?? 0 : undefined),
	},
	tableCellContent: {
		height: '100%',
		padding: '14px 20px',
		width: '100%',
		display: 'inline-flex',
		flexDirection: 'column',
		justifyContent: 'center',
		borderRight: ({ stickyBorder }: UseStylesProps) =>
			stickyBorder ? `1px solid ${theme.colors.n100}` : undefined,

		fontWeight: ({ header }: UseStylesProps) => (header ? 500 : undefined),
		whiteSpace: ({ header }: UseStylesProps) => (header ? 'nowrap' : undefined),
	},
	sortableButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		display: 'inline-flex',
		justifyContent: 'center',
		'&:focus': {
			boxShadow: 'none !important',
		},
	},
	sortableIcon: {
		display: 'block',
	},
}));

interface TableCellProps extends PropsWithChildren {
	header?: boolean;
	width?: number | string;
	sticky?: boolean;
	stickyBorder?: boolean;
	stickyOffset?: number;
	sortable?: boolean;
	className?: string;
	sortDirection?: SORT_DIRECTION | null;
	onSort?(sortDirection: SORT_DIRECTION): void;
	colSpan?: number;
}

export const TableCell: FC<TableCellProps> = React.memo(
	({
		header,
		width,
		sticky,
		stickyBorder,
		stickyOffset,
		sortable,
		className,
		sortDirection,
		onSort,
		colSpan,
		children,
	}) => {
		const classes = useTableCellStyles({
			header,
			width,
			sticky,
			stickyBorder,
			stickyOffset,
			sortable,
		});

		function handleSortButtonClick() {
			if (!onSort) {
				return;
			}

			if (sortDirection === SORT_DIRECTION.ASC) {
				onSort(SORT_DIRECTION.DESC);
			} else {
				onSort(SORT_DIRECTION.ASC);
			}
		}

		return (
			<td className={classes.tableCell} colSpan={colSpan}>
				<div className={classNames(classes.tableCellContent, className)}>
					{children}
					{header && sortable && (
						<Button variant="link" className={classes.sortableButton} onClick={handleSortButtonClick}>
							{!sortDirection && <>Not Sorting</>}
							{sortDirection === SORT_DIRECTION.ASC && <>Sorting ASC</>}
							{sortDirection === SORT_DIRECTION.DESC && <>Sorting DESC</>}
						</Button>
					)}
				</div>
			</td>
		);
	}
);
