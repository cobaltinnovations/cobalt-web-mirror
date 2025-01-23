import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import { ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	RowSelectionForm,
	RowSettingsHeader,
	RowSettingsOneColumn,
	RowSettingsResources,
	RowSettingsThreeColumns,
	RowSettingsTwoColumns,
	SectionHeroSettingsForm,
	SectionSettingsForm,
} from '@/components/admin/pages';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as BackArrowIcon } from '@/assets/icons/icon-back-arrow.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-delete.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import usePageBuilderContext from '@/hooks/use-page-builder-context';

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
	onEditButtonClick(): void;
	onDeleteButtonClick(): void;
}

enum PAGE_STATES {
	SECTION_SETTINGS = 'SECTION_SETTINGS',
	ADD_ROW = 'ADD_ROW',
	RESOURCES_ROW_SETTINGS = 'RESOURCES_ROW_SETTINGS',
	GROUP_SESSIONS_ROW_SETTINGS = 'GROUP_SESSIONS_ROW_SETTINGS',
	TAG_GROUP_ROW_SETTINGS = 'TAG_GROUP_ROW_SETTINGS',
	ONE_COLUMN_ROW_SETTINGS = 'ONE_COLUMN_ROW_SETTINGS',
	TWO_COLUMN_ROW_SETTINGS = 'TWO_COLUMN_ROW_SETTINGS',
	THREE_COLUMN_ROW_SETTINGS = 'THREE_COLUMN_ROW_SETTINGS',
}

export const PageSectionShelf = ({ onEditButtonClick, onDeleteButtonClick }: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState(PAGE_STATES.SECTION_SETTINGS);
	const [isNext, setIsNext] = useState(true);
	const { setCurrentPageSectionId, currentPageSection, setCurrentPageRowId } = usePageBuilderContext();

	useEffect(() => {
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [currentPageSection?.pageSectionId]);

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
									<h5 className="mb-0 text-truncate">{currentPageSection?.name}</h5>
									{currentPageSection?.pageSectionId !== HERO_SECTION_ID && (
										<Button variant="link" className="p-2 ms-2" onClick={onEditButtonClick}>
											<EditIcon />
										</Button>
									)}
								</div>
								<div className="d-flex align-items-center">
									{currentPageSection?.pageSectionId !== HERO_SECTION_ID && (
										<Button variant="link" className="p-2" onClick={onDeleteButtonClick}>
											<TrashIcon />
										</Button>
									)}
									<Button
										variant="link"
										className="p-2"
										onClick={() => {
											setCurrentPageSectionId('');
										}}
									>
										<CloseIcon />
									</Button>
								</div>
							</div>
							<div
								className={classNames(classes.body, {
									'pt-0': currentPageSection?.pageSectionId !== HERO_SECTION_ID,
								})}
							>
								{currentPageSection?.pageSectionId === HERO_SECTION_ID ? (
									<SectionHeroSettingsForm />
								) : (
									<SectionSettingsForm
										onAddRowButtonClick={() => {
											setIsNext(true);
											setPageState(PAGE_STATES.ADD_ROW);
										}}
										onRowButtonClick={(pageRow) => {
											setCurrentPageRowId(pageRow.pageRowId);
											setIsNext(true);
											if (pageRow.rowTypeId === ROW_TYPE_ID.RESOURCES) {
												setPageState(PAGE_STATES.RESOURCES_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.GROUP_SESSIONS) {
												setPageState(PAGE_STATES.GROUP_SESSIONS_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.TAG_GROUP) {
												setPageState(PAGE_STATES.TAG_GROUP_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE) {
												setPageState(PAGE_STATES.ONE_COLUMN_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_IMAGE) {
												setPageState(PAGE_STATES.TWO_COLUMN_ROW_SETTINGS);
											}
											if (pageRow.rowTypeId === ROW_TYPE_ID.THREE_COLUMN_IMAGE) {
												setPageState(PAGE_STATES.THREE_COLUMN_ROW_SETTINGS);
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
									onRowAdded={() => {
										setIsNext(false);
										setPageState(PAGE_STATES.SECTION_SETTINGS);
									}}
								/>
							</div>
						</div>
					)}

					{pageState === PAGE_STATES.RESOURCES_ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<RowSettingsHeader
									title="Resources (N)"
									onBackButtonClick={() => {
										setCurrentPageRowId('');
										setIsNext(false);
										setPageState(PAGE_STATES.SECTION_SETTINGS);
									}}
									onDeleteButtonClick={() => {
										return;
									}}
								/>
							</div>
							<div className={classes.body}>
								<RowSettingsResources />
							</div>
						</div>
					)}

					{pageState === PAGE_STATES.ONE_COLUMN_ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<RowSettingsHeader
									title="Custom Row (1 Item)"
									onBackButtonClick={() => {
										setCurrentPageRowId('');
										setIsNext(false);
										setPageState(PAGE_STATES.SECTION_SETTINGS);
									}}
									onDeleteButtonClick={() => {
										return;
									}}
								/>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<RowSettingsOneColumn />
							</div>
						</div>
					)}

					{pageState === PAGE_STATES.TWO_COLUMN_ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<RowSettingsHeader
									title="Custom Row (2 Items)"
									onBackButtonClick={() => {
										setCurrentPageRowId('');
										setIsNext(false);
										setPageState(PAGE_STATES.SECTION_SETTINGS);
									}}
									onDeleteButtonClick={() => {
										return;
									}}
								/>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<RowSettingsTwoColumns />
							</div>
						</div>
					)}

					{pageState === PAGE_STATES.THREE_COLUMN_ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<RowSettingsHeader
									title="Custom Row (3 Items)"
									onBackButtonClick={() => {
										setCurrentPageRowId('');
										setIsNext(false);
										setPageState(PAGE_STATES.SECTION_SETTINGS);
									}}
									onDeleteButtonClick={() => {
										return;
									}}
								/>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<RowSettingsThreeColumns />
							</div>
						</div>
					)}
				</>
			</CSSTransition>
		</TransitionGroup>
	);
};
