import React, { useCallback, useState } from 'react';
import { ROW_TYPE_ID } from '@/lib/models';
import {
	HERO_SECTION_ID,
	PageSectionShelfPage,
	RowSelectionForm,
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

export const PageSectionShelf = () => {
	const handleError = useHandleError();
	const {
		setCurrentPageSectionId,
		currentPageSection,
		setCurrentPageRowId,
		currentPageRow,
		deletePageRow,
		setIsSaving,
	} = usePageBuilderContext();
	const [showRowDeleteModal, setShowRowDeleteModal] = useState(false);

	const handleClose = useCallback(() => {
		setCurrentPageSectionId('');
		setCurrentPageRowId('');
	}, [setCurrentPageRowId, setCurrentPageSectionId]);

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

	if (!currentPageSection) {
		return null;
	}

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

			{currentPageSection.pageSectionId === HERO_SECTION_ID ? (
				<PageSectionShelfPage
					showCloseButton
					onCloseButtonButtonClick={handleClose}
					title="Hero"
					bodyClassName="pt-0"
				>
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
			)}
		</>
	);
};
