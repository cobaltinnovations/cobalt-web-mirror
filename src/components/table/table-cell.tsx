import React, { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { SORT_DIRECTION } from '.';
import { createUseThemedStyles } from '@/jss/theme';

interface useStylesProps {
	header?: boolean;
	width?: string | number;
	sticky?: boolean;
	stickyOffset?: string | number;
	sortable?: boolean;
}

const useTableCellStyles = createUseThemedStyles((theme) => ({
	tableCell: ({ width, sticky, stickyOffset }: useStylesProps) => ({
		height: 1, // Don't worry, this is ignored by the browser. It's a hack to allow a 100% height inner <div/>
		padding: 0,
		width: width ?? 'auto',
		backgroundColor: 'inherit',
		...(sticky && {
			position: 'sticky',
			left: stickyOffset ?? 0,
		}),
	}),
	tableCellContent: ({ width, sticky, header }: useStylesProps) => ({
		height: '100%',
		padding: '14px 20px',
		width: width ?? '100%',
		display: 'inline-flex',
		flexDirection: 'column',
		justifyContent: 'center',
		...(sticky && {
			borderRight: `1px solid ${theme.colors.n100}`,
		}),
		...(header && {
			fontWeight: 500,
			whiteSpace: 'nowrap',
		}),
	}),
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
	stickyOffset?: number;
	sortable?: boolean;
	className?: string;
	sortDirection?: SORT_DIRECTION | null;
	onSort?(sortDirection: SORT_DIRECTION): void;
	colSpan?: number;
}

export const TableCell: FC<TableCellProps> = React.memo(
	({ header, width, sticky, stickyOffset, sortable, className, sortDirection, onSort, colSpan, children }) => {
		const classes = useTableCellStyles({
			header,
			width,
			sticky,
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
