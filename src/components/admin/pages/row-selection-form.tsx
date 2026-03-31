import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
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
import { BACKGROUND_COLOR_ID, PageDetailModel, ROW_TYPE_ID } from '@/lib/models';
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

	const { page, currentPageSection, addPageRowToCurrentPageSection, setCurrentPageRowId, setIsSaving } =
		usePageBuilderContext();
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

	const handleOneColumnButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createOneColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleOneColumnTextButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createOneColumnTextRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleOneColumnRightButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createOneColumnImageRightRow(currentPageSection.pageSectionId)
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleTwoColumnButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createTwoColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleTwoColumnTextButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createTwoColumnTextRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleThreeColumnButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createThreeColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			setCurrentPageRowId(pageRow.pageRowId);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleEmptyRowButtonClick = async () => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const customRowName = getNextCustomRowName(page);
			const { pageRow } = await pagesService
				.createCustomRow(currentPageSection.pageSectionId, {
					name: customRowName,
					backgroundColorId: BACKGROUND_COLOR_ID.WHITE,
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
				tagId=""
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
			<CollapseButton title="Text" initialShow>
				<p className="mb-4">Text rows use the rich text editor and stack responsively on smaller screens.</p>
				<div className="pb-6">
					<CustomRowButton className="mb-4" title="Select Layout" onClick={handleOneColumnTextButtonClick} />
					<CustomRowButton cols={2} title="Select Layout" onClick={handleTwoColumnTextButtonClick} />
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Text & Image" initialShow>
				<p className="mb-4">Use these layouts to combine editable text with one or more images.</p>
				<div className="pb-6">
					<CustomRowButton className="mb-4" title="Select Layout" onClick={handleOneColumnButtonClick} />
					<CustomRowButton className="mb-4" title="Select Layout" onClick={handleOneColumnRightButtonClick} />
					<CustomRowButton
						className="mb-4"
						cols={2}
						title="Select Layout"
						onClick={handleTwoColumnButtonClick}
					/>
					<CustomRowButton cols={3} title="Select Layout" onClick={handleThreeColumnButtonClick} />
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Custom Row" initialShow>
				<p className="mb-4">Start with an empty custom row and build it out in the editor.</p>
				<div className="pb-6">
					<CustomRowButton title="Empty Row" onClick={handleEmptyRowButtonClick} />
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
