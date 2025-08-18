import React, { FC, PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import SvgIcon from '@/components/svg-icon';

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
	customHeaderElements?: JSX.Element;
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
	customHeaderElements,
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
							<SvgIcon kit="far" icon="arrow-left" size={20} />
						</Button>
					)}
					<h5 className="mb-0 text-truncate">{title}</h5>
					{showEditButton && (
						<Button variant="link" className="p-2 ms-2" onClick={onEditButtonClick}>
							<SvgIcon kit="far" icon="pen" size={16} />
						</Button>
					)}
				</div>
				<div className="d-flex align-items-center">
					{customHeaderElements}
					{showDeleteButton && (
						<Button variant="link" className="p-2" onClick={onDeleteButtonClick}>
							<SvgIcon kit="far" icon="trash-can" size={16} />
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
