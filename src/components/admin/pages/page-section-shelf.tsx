import React, { useCallback, useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	PageSectionShelfPage,
	RowSelectionForm,
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
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import ConfirmDialog from '@/components/confirm-dialog';
import { createUseThemedStyles } from '@/jss/theme';

const shelfPageTransitionDurationMs = 300;

const useStyles = createUseThemedStyles((theme) => ({
	transitionContainer: {
		height: '100%',
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: theme.colors.n0,
	},
	transitionPage: {
		inset: 0,
		height: '100%',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
	},
	'@global': {
		'.shelf-page-animation-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.shelf-page-animation-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `transform ${shelfPageTransitionDurationMs}ms cubic-bezier(.33,1,.33,1), opacity ${shelfPageTransitionDurationMs}ms ease`,
		},
		'.shelf-page-animation-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.shelf-page-animation-exit-active': {
			opacity: 1,
			transform: 'translateX(-100%)',
			transition: `transform ${shelfPageTransitionDurationMs}ms cubic-bezier(.33,1,.33,1), opacity ${shelfPageTransitionDurationMs}ms ease`,
		},
		'.shelf-page-animation-backward-enter': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.shelf-page-animation-backward-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `transform ${shelfPageTransitionDurationMs}ms cubic-bezier(.33,1,.33,1), opacity ${shelfPageTransitionDurationMs}ms ease`,
		},
		'.shelf-page-animation-backward-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.shelf-page-animation-backward-exit-active': {
			opacity: 1,
			transform: 'translateX(100%)',
			transition: `transform ${shelfPageTransitionDurationMs}ms cubic-bezier(.33,1,.33,1), opacity ${shelfPageTransitionDurationMs}ms ease`,
		},
	},
}));

export const PageSectionShelf = () => {
	const classes = useStyles();
	const handleError = useHandleError();
	const {
		setCurrentPageSectionId,
		currentPageSection,
		setCurrentPageRowId,
		currentPageRow,
		updatePageRow,
		deletePageRow,
		setIsSaving,
	} = usePageBuilderContext();
	const [showRowDeleteModal, setShowRowDeleteModal] = useState(false);
	const [showCustomRowColumnDeleteModal, setShowCustomRowColumnDeleteModal] = useState(false);
	const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
	const [selectedCustomRowColumn, setSelectedCustomRowColumn] = useState<
		{ pageRowColumnId: string; label: string } | undefined
	>();

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
		if (currentPageRow?.rowTypeId !== ROW_TYPE_ID.CUSTOM_ROW) {
			setSelectedCustomRowColumn(undefined);
			return;
		}

		if (
			selectedCustomRowColumn &&
			!currentPageRow.columns.some((column) => column.pageRowColumnId === selectedCustomRowColumn.pageRowColumnId)
		) {
			setSelectedCustomRowColumn(undefined);
		}
	}, [currentPageRow, selectedCustomRowColumn]);

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
			if (!currentPageRow || !selectedCustomRowColumn) {
				throw new Error('currentPageRow or selectedCustomRowColumn is undefined.');
			}

			const { pageRow: updatedPageRow } = await pagesService
				.deleteCustomRowColumn(currentPageRow.pageRowId, selectedCustomRowColumn.pageRowColumnId)
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
	}, [currentPageRow, handleError, selectedCustomRowColumn, setIsSaving, updatePageRow]);

	if (!currentPageSection) {
		return null;
	}

	const transitionClassNames =
		transitionDirection === 'backward' ? 'shelf-page-animation-backward' : 'shelf-page-animation';

	const currentPageKey =
		currentPageSection.pageSectionId === HERO_SECTION_ID
			? 'hero'
			: currentPageRow
			? currentPageRow.rowTypeId === ROW_TYPE_ID.CUSTOM_ROW && selectedCustomRowColumn
				? `row-${currentPageRow.pageRowId}-column-${selectedCustomRowColumn.pageRowColumnId}`
				: `row-${currentPageRow.pageRowId}`
			: 'row-selection';

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
					(selectedCustomRowColumn ? (
						<PageSectionShelfPage
							showBackButton
							onBackButtonClick={handleCustomRowColumnBack}
							showDeleteButton
							onDeleteButtonClick={() => {
								setShowCustomRowColumnDeleteModal(true);
							}}
							showCloseButton
							onCloseButtonButtonClick={handleClose}
							title={`Column ${selectedCustomRowColumn.label}`}
						>
							<RowSettingsCustomRowColumn pageRowColumnId={selectedCustomRowColumn.pageRowColumnId} />
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
									setSelectedCustomRowColumn({ pageRowColumnId, label });
								}}
							/>
						</PageSectionShelfPage>
					))}

				{(currentPageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE ||
					currentPageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT ||
					currentPageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_TEXT) && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsOneColumn />
					</PageSectionShelfPage>
				)}

				{(currentPageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_IMAGE ||
					currentPageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_TEXT) && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsTwoColumns />
					</PageSectionShelfPage>
				)}

				{currentPageRow.rowTypeId === ROW_TYPE_ID.THREE_COLUMN_IMAGE && (
					<PageSectionShelfPage
						showDeleteButton
						onDeleteButtonClick={() => {
							setShowRowDeleteModal(true);
						}}
						showCloseButton
						onCloseButtonButtonClick={handleClose}
						title={currentPageRow.name}
					>
						<RowSettingsThreeColumns />
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

			<div className={classes.transitionContainer}>
				<TransitionGroup
					component={null}
					childFactory={(child) =>
						React.cloneElement(child, {
							classNames: transitionClassNames,
						})
					}
				>
					<CSSTransition
						key={currentPageKey}
						timeout={shelfPageTransitionDurationMs}
						classNames={transitionClassNames}
						unmountOnExit
					>
						<div className={classes.transitionPage}>{currentPage}</div>
					</CSSTransition>
				</TransitionGroup>
			</div>
		</>
	);
};
