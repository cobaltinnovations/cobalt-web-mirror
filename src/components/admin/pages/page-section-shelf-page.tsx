import React, { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as BackArrowIcon } from '@/assets/icons/icon-back-arrow.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-delete.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;

const useStyles = createUseThemedStyles((theme) => ({
	page: {
		height: '100%',
		position: 'relative',
	},
	header: {
		display: 'flex',
		padding: '0 24px',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: PAGE_SECTION_SHELF_HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.colors.border}`,
		'& > div:first-child': {
			minWidth: 0,
		},
	},
	body: {
		padding: 24,
		overflowY: 'auto',
		height: `calc(100% - ${PAGE_SECTION_SHELF_HEADER_HEIGHT}px)`,
	},
}));

interface PageSectionShelfPageProps {
	title: string;
	showBackButton?: boolean;
	onBackButtonClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	showEditButton?: boolean;
	onEditButtonClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	showDeleteButton?: boolean;
	onDeleteButtonClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	showCloseButton?: boolean;
	onCloseButtonButtonClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	className?: string;
	headerClassName?: string;
	bodyClassName?: string;
}

export const PageSectionShelfPage: FC<PropsWithChildren<PageSectionShelfPageProps>> = ({
	title,
	showBackButton,
	onBackButtonClick,
	showEditButton,
	onEditButtonClick,
	showDeleteButton,
	onDeleteButtonClick,
	showCloseButton,
	onCloseButtonButtonClick,
	className,
	headerClassName,
	bodyClassName,
	children,
}) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.page, className)}>
			<div className={classNames(classes.header, headerClassName)}>
				<div className="d-flex align-items-center">
					{showBackButton && (
						<Button variant="link" className="p-2 me-2" onClick={onBackButtonClick}>
							<BackArrowIcon />
						</Button>
					)}
					<h5 className="mb-0 text-truncate">{title}</h5>
					{showEditButton && (
						<Button variant="link" className="p-2 ms-2" onClick={onEditButtonClick}>
							<EditIcon />
						</Button>
					)}
				</div>
				<div className="d-flex align-items-center">
					{showDeleteButton && (
						<Button variant="link" className="p-2" onClick={onDeleteButtonClick}>
							<TrashIcon />
						</Button>
					)}
					{showCloseButton && (
						<Button variant="link" className="p-2" onClick={onCloseButtonButtonClick}>
							<CloseIcon />
						</Button>
					)}
				</div>
			</div>
			<div className={classNames(classes.body, bodyClassName)}>{children}</div>
		</div>
	);
};
