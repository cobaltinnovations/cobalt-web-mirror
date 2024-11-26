import { range } from 'lodash';
import React, { FC, useCallback, useMemo } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

const useTablePaginationStyles = createUseThemedStyles((theme) => ({
	paginationButton: {
		width: 32,
		height: 32,
		padding: 0,
		borderRadius: 4,
		textDecoration: 'none',
		...theme.fonts.bodyNormal,
		'&:hover': {
			textDecoration: 'none',
		},
		'&:disabled': {
			color: theme.colors.n300,
			backgroundColor: 'transparent',
			'&:hover': {
				color: theme.colors.n300,
				backgroundColor: 'transparent',
			},
		},
	},
	active: {
		backgroundColor: theme.colors.p500,
		color: `${theme.colors.n0} !important`,
		'&:hover': {
			backgroundColor: theme.colors.p300,
		},
	},
}));

interface TablePaginationProps {
	page: number;
	size: number;
	total: number;
	onClick(pageIndex: number): void;
	disabled?: boolean;
}

export const TablePagination: FC<TablePaginationProps> = React.memo(({ page, size, total, disabled, onClick }) => {
	const classes = useTablePaginationStyles();

	const totalPages = Math.ceil(total / size);
	const lastPage = totalPages > 0 ? totalPages - 1 : 0;

	const getPageButtonConfig = useCallback(
		(index: number) => {
			return {
				index,
				title: String(index + 1),
				isActive: index === page,
			};
		},
		[page]
	);

	const pageButtons = useMemo(() => {
		const blockSize = 5;
		const blockBuffer = 2;
		const firstPage = 0;

		if (totalPages <= blockSize) {
			return range(firstPage, lastPage + 1).map((index) => {
				return getPageButtonConfig(index);
			});
		}

		const currentBlock = range(page - blockBuffer, page + 1 + blockBuffer);

		if (currentBlock[0] <= firstPage) {
			return range(firstPage, blockSize + firstPage).map((index) => {
				return getPageButtonConfig(index);
			});
		}

		if (currentBlock[currentBlock.length - 1] >= lastPage) {
			return range(lastPage + 1 - blockSize, lastPage + 1).map((index) => {
				return getPageButtonConfig(index);
			});
		}

		return currentBlock.map((index) => {
			return getPageButtonConfig(index);
		});
	}, [getPageButtonConfig, lastPage, page, totalPages]);

	function handlePreviousButtonClick() {
		const previousPage = page - 1;

		if (previousPage < 0) {
			return;
		}

		onClick(previousPage);
	}

	function handlePaginationButtonClick(buttonIndex: number) {
		if (buttonIndex === page) {
			return;
		}

		onClick(buttonIndex);
	}

	function handleNextButtonClick() {
		const nextPage = page + 1;

		if (nextPage > lastPage) {
			return;
		}

		onClick(nextPage);
	}

	return (
		<ButtonGroup aria-label="Pagination">
			<Button
				variant="link"
				size="sm"
				className={classes.paginationButton}
				onClick={handlePreviousButtonClick}
				disabled={page === 0 || disabled}
			>
				<LeftChevron width={24} height={24} />
			</Button>
			{pageButtons.length > 1 &&
				pageButtons.map((button) => {
					return (
						<Button
							key={button.index}
							variant="link"
							size="sm"
							className={classNames(classes.paginationButton, {
								[classes.active]: button.isActive,
							})}
							onClick={() => {
								handlePaginationButtonClick(button.index);
							}}
							disabled={disabled}
						>
							{button.title}
						</Button>
					);
				})}
			<Button
				variant="link"
				size="sm"
				className={classes.paginationButton}
				onClick={handleNextButtonClick}
				disabled={page === lastPage || disabled}
			>
				<RightChevron width={24} height={24} />
			</Button>
		</ButtonGroup>
	);
});
