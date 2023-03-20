import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	clickable: boolean;
	highlighted: boolean;
}

const useTableRowStyles = createUseThemedStyles((theme) => ({
	tableRow: {
		backgroundColor: ({ highlighted }: UseStylesProps) => (highlighted ? theme.colors.n75 : 'inherit'),
		borderBottom: `1px solid ${theme.colors.n100}`,
		cursor: ({ clickable }: UseStylesProps) => (clickable ? 'pointer' : 'default'),
		'&:hover': {
			backgroundColor: ({ clickable }: UseStylesProps) => (clickable ? theme.colors.n50 : 'inherit'),
		},
		'&:last-child': {
			borderBottom: 0,
		},
	},
}));

interface TableRowProps extends PropsWithChildren {
	onClick?(event: React.MouseEvent<HTMLTableRowElement, MouseEvent>): void;
	className?: string;
	highlighted?: boolean;
}

export const TableRow: FC<TableRowProps> = React.memo(({ onClick, highlighted = false, className, children }) => {
	const classes = useTableRowStyles({
		clickable: !!onClick,
		highlighted: highlighted,
	});

	return (
		<tr className={classNames(classes.tableRow, className)} onClick={onClick}>
			{children}
		</tr>
	);
});
