import React, { useCallback, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { isCustomRow, isOneColumnRow, isThreeColumnImageRow, isTwoColumnRow, ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	PageSectionShelfPage,
	RowSelectionForm,
	RowSettingsCallToAction,
	RowSettingsCustomRow,
	RowSettingsCustomRowColumn,
	RowSettingsGroupSessions,
	RowSettingsMailingList,
	RowSettingsOneColumn,
	RowSettingsResources,
	RowSettingsTag,
	RowSettingsTagGroup,
	RowSettingsThreeColumns,
	RowSettingsTwoColumns,
	SectionHeroSettingsForm,
} from '@/components/admin/pages';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { PageBuilderContext } from '@/contexts/page-builder-context';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import ConfirmDialog from '@/components/confirm-dialog';
import { createUseThemedStyles } from '@/jss/theme';

const shelfPageTransitionDurationMs = 300;
const shelfPageTransition = `transform ${shelfPageTransitionDurationMs}ms cubic-bezier(.33,1,.33,1)`;

const useStyles = createUseThemedStyles((theme) => ({
	transitionContainer: {
		height: '100%',
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: theme.colors.n0,
	},
	transitionPage: {
		inset: 0,
		zIndex: 0,
		height: '100%',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
	},
	'@global': {
		// Forward navigation slides the incoming page over the stationary outgoing page.
		'.shelf-page-animation-enter': {
			zIndex: 1,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(100%)',
		},
		'.shelf-page-animation-enter-active': {
			zIndex: 1,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
			transition: shelfPageTransition,
		},
		'.shelf-page-animation-exit': {
			zIndex: 0,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
			transition: shelfPageTransition,
		},
		'.shelf-page-animation-exit-active': {
			zIndex: 0,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
			transition: shelfPageTransition,
		},
		// Back navigation slides the outgoing page away to reveal the stationary incoming page.
		'.shelf-page-animation-backward-enter': {
			zIndex: 0,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
		},
		'.shelf-page-animation-backward-enter-active': {
			zIndex: 0,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
			transition: 'none',
		},
		'.shelf-page-animation-backward-exit': {
			zIndex: 1,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(0)',
		},
		'.shelf-page-animation-backward-exit-active': {
			zIndex: 1,
			opacity: 1,
			pointerEvents: 'none',
			transform: 'translateX(100%)',
			transition: shelfPageTransition,
		},
	},
}));

export const PageSectionShelf = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const pageBuilderContext = usePageBuilderContext();
	const {
		setCurrentPageSectionId,
		currentPageSection,
		setCurrentPageRowId,
		currentPageRow,
		updatePageRow,
		deletePageRow,
		setIsSaving,
	} = pageBuilderContext;
	const [showRowDeleteModal, setShowRowDeleteModal] = useState(false);
	const [showCustomRowColumnDeleteModal, setShowCustomRowColumnDeleteModal] = useState(false);
	const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
	const [selectedCustomRowColumn, setSelectedCustomRowColumn] = useState<
		{ pageRowId: string; pageRowColumnId: string; label: string } | undefined
	>();
	const activeSelectedCustomRowColumn =
		currentPageRow &&
		isCustomRow(currentPageRow) &&
		selectedCustomRowColumn?.pageRowId === currentPageRow.pageRowId &&
		currentPageRow.columns.some((column) => column.pageRowColumnId === selectedCustomRowColumn.pageRowColumnId)
			? selectedCustomRowColumn
			: undefined;

	const handleClose = useCallback(() => {
		setSelectedCustomRowColumn(undefined);
		setCurrentPageSectionId('');
		setCurrentPageRowId('');
	}, [setCurrentPageRowId, setCurrentPageSectionId]);

	const handleCustomRowColumnBack = useCallback(() => {
		setTransitionDirection('backward');
		setSelectedCustomRowColumn(undefined);
	}, []);

	useEffect(() => {
		setSelectedCustomRowColumn(undefined);
		setTransitionDirection('forward');
	}, [currentPageRow?.pageRowId]);

	useEffect(() => {
		if (selectedCustomRowColumn && !activeSelectedCustomRowColumn) {
			setSelectedCustomRowColumn(undefined);
		}
	}, [activeSelectedCustomRowColumn, selectedCustomRowColumn]);

	const handleRowDelete = useCallback(async () => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			await pagesService.deletePageRow(currentPageRow.pageRowId).fetch();

			deletePageRow(currentPageRow.pageRowId);
			setShowRowDeleteModal(false);
			handleClose();
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [currentPageRow, deletePageRow, handleClose, handleError, setIsSaving]);

	const handleCustomRowColumnDelete = useCallback(async () => {
		setIsSaving(true);

		try {
			if (!currentPageRow || !activeSelectedCustomRowColumn) {
				throw new Error('currentPageRow or activeSelectedCustomRowColumn is undefined.');
			}

			const { pageRow: updatedPageRow } = await pagesService
				.deleteCustomRowColumn(currentPageRow.pageRowId, activeSelectedCustomRowColumn.pageRowColumnId)
				.fetch();

			updatePageRow(updatedPageRow);
			setTransitionDirection('backward');
			setSelectedCustomRowColumn(undefined);
			setShowCustomRowColumnDeleteModal(false);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [activeSelectedCustomRowColumn, currentPageRow, handleError, setIsSaving, updatePageRow]);

	if (!currentPageSection) {
		return null;
	}

	const transitionClassNames =
		transitionDirection === 'backward' ? 'shelf-page-animation-backward' : 'shelf-page-animation';

	const currentTopLevelPageKey =
		currentPageSection.pageSectionId === HERO_SECTION_ID
			? 'hero'
			: currentPageRow
			? `row-${currentPageRow.pageRowId}`
			: `section-${currentPageSection.pageSectionId}-row-selection`;
	const currentCustomRowPageKey = activeSelectedCustomRowColumn
		? `column-${activeSelectedCustomRowColumn.pageRowColumnId}`
		: 'overview';

	const currentPage =
		currentPageSection.pageSectionId === HERO_SECTION_ID ? (
			<PageSectionShelfPage showCloseButton onCloseButtonButtonClick={handleClose} title="Hero">
				<SectionHeroSettingsForm />
			</PageSectionShelfPage>
		) : currentPageRow ? (
			<>
				{currentPageRow.rowTypeId === ROW_TYPE_ID.RESOURCES && (
					<RowSettingsResources onDeleteButtonClick={() => setShowRowDeleteModal(true)} />
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.GROUP_SESSIONS && (
					<RowSettingsGroupSessions onDeleteButtonClick={() => setShowRowDeleteModal(true)} />
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.TAG_GROUP && (
					<RowSettingsTagGroup onDeleteButtonClick={() => setShowRowDeleteModal(true)} />
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.TAG && (
					<RowSettingsTag onDeleteButtonClick={() => setShowRowDeleteModal(true)} />
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.CUSTOM_ROW &&
					(activeSelectedCustomRowColumn ? (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={handleCustomRowColumnBack}
							showDeleteButton
							onDeleteButtonClick={() => {
								setShowCustomRowColumnDeleteModal(true);
							}}
							showCloseButton
							onCloseButtonButtonClick={handleClose}
							bodyClassName="pt-0"
							title={`Column ${activeSelectedCustomRowColumn.label}`}
						>
							<RowSettingsCustomRowColumn
								pageRowColumnId={activeSelectedCustomRowColumn.pageRowColumnId}
							/>
						</PageSectionShelfPage>
					) : (
						<PageSectionShelfPage
							showDeleteButton
							onDeleteButtonClick={() => {
								setShowRowDeleteModal(true);
							}}
							showCloseButton
							onCloseButtonButtonClick={handleClose}
							title={currentPageRow.name}
						>
							<RowSettingsCustomRow
								onColumnClick={(pageRowColumnId, label) => {
									setTransitionDirection('forward');
									setSelectedCustomRowColumn({
										pageRowId: currentPageRow.pageRowId,
										pageRowColumnId,
										label,
									});
								}}
							/>
						</PageSectionShelfPage>
					))}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_BLOCK && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsCallToAction variant="block" />
					</PageSectionShelfPage>
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_FULL_WIDTH && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsCallToAction variant="full-width" />
					</PageSectionShelfPage>
				)}

				{isOneColumnRow(currentPageRow) && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsOneColumn pageRow={currentPageRow} />
					</PageSectionShelfPage>
				)}

				{isTwoColumnRow(currentPageRow) && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsTwoColumns pageRow={currentPageRow} />
					</PageSectionShelfPage>
				)}

				{isThreeColumnImageRow(currentPageRow) && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsThreeColumns pageRow={currentPageRow} />
					</PageSectionShelfPage>
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.MAILING_LIST && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsMailingList />
					</PageSectionShelfPage>
				)}
			</>
		) : (
			<PageSectionShelfPage
				showCloseButton
				onCloseButtonButtonClick={handleClose}
				title="Select row type to add"
				bodyClassName="pt-0"
			>
				<RowSelectionForm />
			</PageSectionShelfPage>
		);

	return (
		<>
			<ConfirmDialog
				show={showRowDeleteModal}
				size="lg"
				titleText="Delete Row"
				bodyText="Are you sure you want to delete this row?"
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setShowRowDeleteModal(false);
				}}
				onConfirm={handleRowDelete}
			/>
			<ConfirmDialog
				show={showCustomRowColumnDeleteModal}
				size="lg"
				titleText="Delete Column"
				bodyText="Are you sure you want to delete this column?"
				dismissText="Cancel"
				confirmText="Delete"
				destructive
				onHide={() => {
					setShowCustomRowColumnDeleteModal(false);
				}}
				onConfirm={handleCustomRowColumnDelete}
			/>

			<div key={currentTopLevelPageKey} className={classes.transitionContainer}>
				{currentPageRow && isCustomRow(currentPageRow) ? (
					<TransitionGroup
						component={null}
						childFactory={(child) =>
							React.cloneElement(child, {
								classNames: transitionClassNames,
							})
						}
					>
						<CSSTransition
							key={currentCustomRowPageKey}
							timeout={shelfPageTransitionDurationMs}
							classNames={transitionClassNames}
							onEntered={() => {
								setTransitionDirection('forward');
							}}
							unmountOnExit
						>
							<div className={classes.transitionPage}>
								<PageBuilderContext.Provider value={pageBuilderContext}>
									{currentPage}
								</PageBuilderContext.Provider>
							</div>
						</CSSTransition>
					</TransitionGroup>
				) : (
					<div className={classes.transitionPage}>
						<PageBuilderContext.Provider value={pageBuilderContext}>
							{currentPage}
						</PageBuilderContext.Provider>
					</div>
				)}
			</div>
		</>
	);
};
