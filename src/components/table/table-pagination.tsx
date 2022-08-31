import React, { FC } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useTablePaginationStyles = createUseThemedStyles((theme) => ({
	active: {
		color: `${theme.colors.n900} !important`,
	},
}));

interface TablePaginationProps {
	page: number;
	size: number;
	total: number;
	onClick(pageIndex: number): void;
}

export const TablePagination: FC<TablePaginationProps> = React.memo(({ page, size, total, onClick }) => {
	const classes = useTablePaginationStyles();
	const buttonIndices: number[] = Array.from(Array(Math.ceil(total / size)).keys());

	function getPageButtonsToShow() {
		let pageArray = [];

		if (page > 0 && page < buttonIndices.length - 1) {
			pageArray = [page];

			if (buttonIndices[page + 1] !== undefined) {
				pageArray.push(page + 1);
			}
			if (buttonIndices[page - 1] !== undefined) {
				pageArray.unshift(page - 1);
			}

			return pageArray;
		}

		if (page === 0) {
			pageArray = [page];

			if (buttonIndices[page + 1] !== undefined) {
				pageArray.push(page + 1);
			}
			if (buttonIndices[page + 2] !== undefined) {
				pageArray.push(page + 2);
			}

			return pageArray;
		}

		if (page === buttonIndices.length - 1) {
			pageArray = [page];

			if (buttonIndices[page - 1] !== undefined) {
				pageArray.unshift(page - 1);
			}
			if (buttonIndices[page - 2] !== undefined) {
				pageArray.unshift(page - 2);
			}

			return pageArray;
		}

		return [];
	}

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

		if (nextPage > buttonIndices.length - 1) {
			return;
		}

		onClick(nextPage);
	}

	const pageButtonsToShow = getPageButtonsToShow();

	return (
		<ButtonGroup aria-label="Pagination">
			{page !== 0 && (
				<Button variant="link" size="sm" onClick={handlePreviousButtonClick}>
					Previous
				</Button>
			)}
			{pageButtonsToShow.length > 1 &&
				pageButtonsToShow.map((buttonIndex) => {
					return (
						<Button
							key={buttonIndex}
							variant="link"
							size="sm"
							className={classNames({
								[classes.active]: buttonIndex === page,
							})}
							onClick={() => {
								handlePaginationButtonClick(buttonIndex);
							}}
						>
							{buttonIndex + 1}
						</Button>
					);
				})}
			{page !== buttonIndices.length - 1 && (
				<Button variant="link" size="sm" onClick={handleNextButtonClick}>
					Next
				</Button>
			)}
		</ButtonGroup>
	);
});
