import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
	CallToActionRowButton,
	CollapseButton,
	CustomRowButton,
	PremadeComponentRowButton,
	SelectGroupSessionsModal,
	SelectResourcesModal,
	SelectTagModal,
} from '@/components/admin/pages';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';

import subscribeImg from '@/assets/images/subscribe.png';
import { BACKGROUND_COLOR_ID, CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID, PageDetailModel, ROW_TYPE_ID } from '@/lib/models';
import InlineAlert from '@/components/inline-alert';

const CUSTOM_ROW_NAME_PREFIX = 'Custom Row';

const getNextCustomRowName = (page?: PageDetailModel) => {
	const maxCustomRowNumber =
		page?.pageSections
			.flatMap((pageSection) => pageSection.pageRows)
			.reduce((max, pageRow) => {
				const match = pageRow.name.match(/^Custom Row(?: (\d+))?$/i);

				if (!match) {
					return max;
				}

				const customRowNumber = match[1] ? Number(match[1]) : 1;

				if (!Number.isFinite(customRowNumber)) {
					return max;
				}

				return Math.max(max, customRowNumber);
			}, 0) ?? 0;

	return `${CUSTOM_ROW_NAME_PREFIX} ${maxCustomRowNumber + 1}`;
};

export const RowSelectionForm = () => {
	const handleError = useHandleError();

	const {
		page,
		currentPageSection,
		addPageRowToCurrentPageSection,
		updatePageRow,
		setCurrentPageRowId,
		setIsSaving,
	} = usePageBuilderContext();
	const [showSelectResourcesModal, setShowSelectResourcesModal] = useState(false);
	const [showSelectGroupSessionsModal, setShowSelectGroupSessionsModal] = useState(false);
	const [showSelectTagModal, setShowSelectTagModal] = useState(false);

	const handleResourcesAdd = async (contentIds: string[]) => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createResourcesRow(currentPageSection.pageSectionId, { contentIds })
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectResourcesModal(false);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleGroupSessionsAdd = async (groupSessionIds: string[]) => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createGroupSessionsRow(currentPageSection.pageSectionId, { groupSessionIds })
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectGroupSessionsModal(false);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleTagAdd = async (tagId: string) => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}
			const { pageRow } = await pagesService.createTagRow(currentPageSection.pageSectionId, { tagId }).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectTagModal(false);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCustomRowPresetButtonClick = async (
		columnConfigs: Array<{
			contentOrderId?: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID;
			usePlaceholderImage?: boolean;
			description?: string;
		}>
	) => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const customRowName = getNextCustomRowName(page);
			const { pageRow: createdPageRow } = await pagesService
				.createCustomRow(currentPageSection.pageSectionId, {
					name: customRowName,
					backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
				})
				.fetch();

			addPageRowToCurrentPageSection(createdPageRow);
			setCurrentPageRowId(createdPageRow.pageRowId);

			let latestPageRow = createdPageRow;

			for (const [columnIndex, columnConfig] of columnConfigs.entries()) {
				const { pageRow } = await pagesService
					.createCustomRowColumn(createdPageRow.pageRowId, {
						contentOrderId: columnConfig.contentOrderId,
						usePlaceholderImage: columnConfig.usePlaceholderImage,
					})
					.fetch();

				latestPageRow = pageRow;
				updatePageRow(pageRow);

				if (columnConfig.description !== undefined) {
					const createdColumn = pageRow.columns.find((column) => column.columnDisplayOrder === columnIndex);

					if (!createdColumn) {
						throw new Error(`Could not find custom row column at display order ${columnIndex}.`);
					}

					const { pageRow: updatedPageRow } = await pagesService
						.updateCustomRowColumn(createdPageRow.pageRowId, createdColumn.pageRowColumnId, {
							description: columnConfig.description,
							imageFileUploadId: createdColumn.imageFileUploadId,
							imageAltText: createdColumn.imageAltText,
							usePlaceholderImage: columnConfig.usePlaceholderImage ?? createdColumn.usePlaceholderImage,
							contentOrderId: createdColumn.contentOrderId,
						})
						.fetch();

					latestPageRow = updatedPageRow;
					updatePageRow(updatedPageRow);
				}
			}

			if (columnConfigs.length === 0) {
				updatePageRow(latestPageRow);
			}
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleMailingListButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createMailingListRow(currentPageSection.pageSectionId, {
					pageSectionId: currentPageSection.pageSectionId,
				})
				.fetch();

			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCallToActionBlockButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createCallToActionBlockRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCallToActionFullWidthButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createCallToActionFullWidthRow(currentPageSection.pageSectionId)
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const pageContainsSubscribeRow =
		page?.pageSections.some((ps) => ps.pageRows.some((pr) => pr.rowTypeId === ROW_TYPE_ID.MAILING_LIST)) ?? false;

	return (
		<>
			<SelectResourcesModal
				contentIds={[]}
				show={showSelectResourcesModal}
				onAdd={handleResourcesAdd}
				onHide={() => {
					setShowSelectResourcesModal(false);
				}}
			/>

			<SelectGroupSessionsModal
				groupSessionIds={[]}
				show={showSelectGroupSessionsModal}
				onAdd={handleGroupSessionsAdd}
				onHide={() => {
					setShowSelectGroupSessionsModal(false);
				}}
			/>

			<SelectTagModal
				show={showSelectTagModal}
				onAdd={handleTagAdd}
				onHide={() => {
					setShowSelectTagModal(false);
				}}
			/>

			<CollapseButton title="Content Row" initialShow>
				<div className="pb-6">
					<p>Use a content row to add existing content from Cobalt.</p>
					<div className="d-flex">
						<Button
							className="me-1 flex-fill"
							onClick={() => {
								setShowSelectResourcesModal(true);
							}}
						>
							Resources
						</Button>
						<Button
							className="mx-1 flex-fill"
							onClick={() => {
								setShowSelectGroupSessionsModal(true);
							}}
						>
							Group Sessions
						</Button>
						<Button
							className="ms-1 flex-fill"
							onClick={() => {
								setShowSelectTagModal(true);
							}}
						>
							Tag
						</Button>
					</div>
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Custom Row" initialShow>
				<p className="mb-4">
					Select from the recommended layouts or start completely from scratch. You will need to add your own
					images and text to custom rows.
				</p>
				<div className="pb-6">
					<CustomRowButton
						className="mb-4"
						title="Select Layout"
						preview="split-two"
						onClick={() =>
							handleCustomRowPresetButtonClick([
								{
									contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT,
									description: '',
								},
								{
									contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.TEXT_THEN_IMAGE,
									usePlaceholderImage: false,
								},
							])
						}
					/>
					<CustomRowButton
						className="mb-4"
						title="Select Layout"
						preview="two-columns"
						onClick={() =>
							handleCustomRowPresetButtonClick([
								{ contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT },
								{ contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT },
							])
						}
					/>
					<CustomRowButton
						className="mb-4"
						title="Select Layout"
						preview="three-columns"
						onClick={() =>
							handleCustomRowPresetButtonClick([
								{ contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT },
								{ contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT },
								{ contentOrderId: CUSTOM_ROW_COLUMN_CONTENT_ORDER_ID.IMAGE_THEN_TEXT },
							])
						}
					/>
					<CustomRowButton
						title="Select Layout"
						preview="empty"
						onClick={() => handleCustomRowPresetButtonClick([])}
					/>
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Call-to-Action" initialShow>
				<div className="pb-6">
					<CallToActionRowButton
						className="mb-4"
						title="Select Layout"
						preview="full-width"
						onClick={handleCallToActionFullWidthButtonClick}
					/>
					<CallToActionRowButton
						title="Select Layout"
						preview="block"
						onClick={handleCallToActionBlockButtonClick}
					/>
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Subscribe (maximum 1 per page)" initialShow>
				{pageContainsSubscribeRow ? (
					<InlineAlert title="Maximum reached" description="You can only add one subscribe row to a page." />
				) : (
					<PremadeComponentRowButton title="Select Layout" onClick={handleMailingListButtonClick}>
						<img src={subscribeImg} alt="Subscribe" />
					</PremadeComponentRowButton>
				)}
			</CollapseButton>
		</>
	);
};
