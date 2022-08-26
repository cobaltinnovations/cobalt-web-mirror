import React, { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { SORT_DIRECTION } from '.';
import { createUseThemedStyles } from '@/jss/theme';

const useTableCellStyles = createUseThemedStyles((theme) => ({
	tableCell: (props: any) => ({
		padding: 0,
		backgroundColor: 'inherit',
		width: props.width ? props.width : 'auto',
		'&.fixed-column': {
			position: 'sticky',
			left: props.fixedOffset ? props.fixedOffset : 0,
		},
	}),
	tableCellContent: (props: any) => ({
		...theme.fonts.large,
		padding: '16px 16px',
		width: typeof props.width === 'string' ? 'auto' : props.width,
		...(props.header
			? {
					...theme.fonts.small,
					display: 'flex',
					...theme.fonts.bodyBold,
					alignItems: 'center',
					whiteSpace: 'nowrap',
					color: theme.colors.n500,
					textTransform: 'uppercase',
					justifyContent: 'space-between',
					...(props.sortable
						? {
								paddingTop: 0,
								paddingRight: 0,
								paddingBottom: 0,
						  }
						: {}),
			  }
			: {}),
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
	fixed?: boolean;
	fixedOffset?: number;
	sortable?: boolean;
	className?: string;
	sortDirection?: SORT_DIRECTION | null;
	onSort?(sortDirection: SORT_DIRECTION): void;
}

export const TableCell: FC<TableCellProps> = React.memo((props) => {
	const classes = useTableCellStyles({
		header: props.header,
		width: props.width,
		fixedOffset: props.fixedOffset,
		sortable: props.sortable,
	});

	function handleSortButtonClick() {
		if (!props.onSort) {
			return;
		}

		if (props.sortDirection === SORT_DIRECTION.ASC) {
			props.onSort(SORT_DIRECTION.DESC);
		} else {
			props.onSort(SORT_DIRECTION.ASC);
		}
	}

	return (
		<td
			className={classNames({
				[classes.tableCell]: true,
				'fixed-column': props.fixed,
			})}
		>
			<div className={classNames(classes.tableCellContent, props.className)}>
				{props.children}
				{props.header && props.sortable && (
					<Button variant="link" className={classes.sortableButton} onClick={handleSortButtonClick}>
						{!props.sortDirection && <>Not Sorting</>}
						{props.sortDirection === SORT_DIRECTION.ASC && <>Sorting ASC</>}
						{props.sortDirection === SORT_DIRECTION.DESC && <>Sorting DESC</>}
					</Button>
				)}
			</div>
		</td>
	);
});
