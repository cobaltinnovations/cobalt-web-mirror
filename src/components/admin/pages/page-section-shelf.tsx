import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import { PageSectionDetailModel, ResourcesRowModel, ROW_TYPE_ID } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import {
	CustomRowForm,
	HERO_SECTION_ID,
	RowSelectionForm,
	SectionHeroSettingsForm,
	SectionSettingsForm,
} from '@/components/admin/pages';

import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as BackArrowIcon } from '@/assets/icons/icon-back-arrow.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-delete.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { cloneDeep } from 'lodash';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;
const PAGE_TRANSITION_DURATION_MS = 600;

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
	'@global': {
		'.right-to-left-enter, .right-to-left-enter-active, .right-to-left-exit, .right-to-left-exit-active, .left-to-right-enter, .left-to-right-enter-active, .left-to-right-exit, .left-to-right-exit-active':
			{
				top: 0,
				left: 0,
				right: 0,
				position: 'absolute',
			},
		'.right-to-left-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.right-to-left-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.right-to-left-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.right-to-left-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-enter ': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.left-to-right-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.left-to-right-exit-active': {
			opacity: 0,
			transform: 'translateX(100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
}));

interface SectionShelfProps {
	pageSection: PageSectionDetailModel;
	onChange(pageSection: PageSectionDetailModel): void;
	onEditButtonClick(): void;
	onDeleteButtonClick(): void;
	onCloseButtonClick(): void;
}

enum PAGE_STATES {
	SECTION_SETTINGS = 'SECTION_SETTINGS',
	ADD_ROW = 'ADD_ROW',
	RESOURCES_ROW_SETTINGS = 'RESOURCES_ROW_SETTINGS',
	GROUP_SESSIONS_ROW_SETTINGS = 'GROUP_SESSIONS_ROW_SETTINGS',
	TAG_GROUP_ROW_SETTINGS = 'TAG_GROUP_ROW_SETTINGS',
	ROW_SETTINGS = 'ROW_SETTINGS',
}

export const PageSectionShelf = ({
	pageSection,
	onChange,
	onEditButtonClick,
	onDeleteButtonClick,
	onCloseButtonClick,
}: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState(PAGE_STATES.SECTION_SETTINGS);
	const [isNext, setIsNext] = useState(true);

	useEffect(() => {
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [pageSection.pageSectionId]);

	const handleResourceRowAdded = (pageRow: ResourcesRowModel) => {
		const pageSectionClone = cloneDeep(pageSection);
		pageSectionClone.pageRows = [...pageSectionClone.pageRows, pageRow];
		onChange(pageSectionClone);

		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	};

	return (
		<TransitionGroup
			component={null}
			childFactory={(child) =>
				React.cloneElement(child, {
					classNames: isNext ? 'right-to-left' : 'left-to-right',
					timeout: PAGE_TRANSITION_DURATION_MS,
				})
			}
		>
			<CSSTransition key={pageState} timeout={PAGE_TRANSITION_DURATION_MS}>
				<>
					{pageState === PAGE_STATES.SECTION_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="d-flex align-items-center">
									<h5 className="mb-0 text-truncate">{pageSection.name}</h5>
									{pageSection.pageSectionId !== HERO_SECTION_ID && (
										<Button variant="link" className="p-2 ms-2" onClick={onEditButtonClick}>
											<EditIcon />
										</Button>
									)}
								</div>
								<div className="d-flex align-items-center">
									{pageSection.pageSectionId !== HERO_SECTION_ID && (
										<Button variant="link" className="p-2" onClick={onDeleteButtonClick}>
											<TrashIcon />
										</Button>
									)}
									<Button variant="link" className="p-2" onClick={onCloseButtonClick}>
										<CloseIcon />
									</Button>
								</div>
							</div>
							<div
								className={classNames(classes.body, {
									'pt-0': pageSection.pageSectionId !== HERO_SECTION_ID,
								})}
							>
								{pageSection.pageSectionId === HERO_SECTION_ID ? (
									<SectionHeroSettingsForm />
								) : (
									<SectionSettingsForm
										pageSection={pageSection}
										onAddRowButtonClick={() => {
											setIsNext(true);
											setPageState(PAGE_STATES.ADD_ROW);
										}}
										onRowButtonClick={(pageRow) => {
											if (pageRow.rowTypeId === ROW_TYPE_ID.RESOURCES) {
												setIsNext(true);
												setPageState(PAGE_STATES.RESOURCES_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.GROUP_SESSIONS) {
												setIsNext(true);
												setPageState(PAGE_STATES.GROUP_SESSIONS_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.TAG_GROUP) {
												setIsNext(true);
												setPageState(PAGE_STATES.TAG_GROUP_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE) {
												setIsNext(true);
												setPageState(PAGE_STATES.ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_IMAGE) {
												setIsNext(true);
												setPageState(PAGE_STATES.ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.THREE_COLUMN_IMAGE) {
												setIsNext(true);
												setPageState(PAGE_STATES.ROW_SETTINGS);
											}
										}}
									/>
								)}
							</div>
						</div>
					)}
					{pageState === PAGE_STATES.ADD_ROW && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="d-flex align-items-center justify-start">
									<Button
										variant="link"
										className="p-2 me-2"
										onClick={() => {
											setIsNext(false);
											setPageState(PAGE_STATES.SECTION_SETTINGS);
										}}
									>
										<BackArrowIcon />
									</Button>
									<h5 className="mb-0">Select row type to add</h5>
								</div>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<RowSelectionForm
									pageSectionId={pageSection.pageSectionId}
									onResourcesRowAdded={handleResourceRowAdded}
									onSelection={() => {
										setIsNext(true);
										setPageState(PAGE_STATES.ROW_SETTINGS);
									}}
								/>
							</div>
						</div>
					)}
					{pageState === PAGE_STATES.RESOURCES_ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="w-100 d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<Button
											variant="link"
											className="p-2 me-2"
											onClick={() => {
												setIsNext(false);
												setPageState(PAGE_STATES.SECTION_SETTINGS);
											}}
										>
											<BackArrowIcon />
										</Button>
										<h5 className="mb-0">Resources</h5>
									</div>
									<Button
										variant="link"
										className="p-2"
										onClick={() => {
											return;
										}}
									>
										<TrashIcon />
									</Button>
								</div>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>TODO: Resources Form</div>
						</div>
					)}
					{pageState === PAGE_STATES.ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="w-100 d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<Button
											variant="link"
											className="p-2 me-2"
											onClick={() => {
												setIsNext(false);
												setPageState(PAGE_STATES.SECTION_SETTINGS);
											}}
										>
											<BackArrowIcon />
										</Button>
										<h5 className="mb-0">Row settings</h5>
									</div>
									<Button
										variant="link"
										className="p-2"
										onClick={() => {
											return;
										}}
									>
										<TrashIcon />
									</Button>
								</div>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<CustomRowForm />
							</div>
						</div>
					)}
				</>
			</CSSTransition>
		</TransitionGroup>
	);
};
