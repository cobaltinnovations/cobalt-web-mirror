import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
	CollapseButton,
	CustomRowButton,
	SelectGroupSessionsModal,
	SelectResourcesModal,
	SelectTagGroupModal,
} from '@/components/admin/pages';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';

interface RowSelectionFormProps {
	onRowAdded(): void;
}

export const RowSelectionForm = ({ onRowAdded }: RowSelectionFormProps) => {
	const handleError = useHandleError();

	const { currentPageSection, addPageRowToCurrentPageSection } = usePageBuilderContext();
	const [showSelectResourcesModal, setShowSelectResourcesModal] = useState(false);
	const [showSelectGroupSessionsModal, setShowSelectGroupSessionsModal] = useState(false);
	const [showSelectTagGroupModal, setShowSelectTagGroupModal] = useState(false);

	const handleResourcesAdd = async (contentIds: string[]) => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createResourcesRow(currentPageSection.pageSectionId, { contentIds })
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectResourcesModal(false);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

	const handleGroupSessionsAdd = async (groupSessionIds: string[]) => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createGroupSessionsRow(currentPageSection.pageSectionId, { groupSessionIds })
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectGroupSessionsModal(false);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

	const handleTagGroupAdd = async (tagGroupId: string) => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService
				.createTagGroupRow(currentPageSection.pageSectionId, { tagGroupId })
				.fetch();
			addPageRowToCurrentPageSection(pageRow);
			setShowSelectTagGroupModal(false);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

	const handleOneColumnButtonClick = async () => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createOneColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

	const handleTwoColumnButtonClick = async () => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createTwoColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

	const handleThreeColumnButtonClick = async () => {
		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined.');
			}

			const { pageRow } = await pagesService.createThreeColumnRow(currentPageSection.pageSectionId).fetch();
			addPageRowToCurrentPageSection(pageRow);
			onRowAdded();
		} catch (error) {
			handleError(error);
		}
	};

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

			<SelectTagGroupModal
				tagGroupId=""
				show={showSelectTagGroupModal}
				onAdd={handleTagGroupAdd}
				onHide={() => {
					setShowSelectTagGroupModal(false);
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
								setShowSelectTagGroupModal(true);
							}}
						>
							Tag Group
						</Button>
					</div>
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Custom Row" initialShow>
				<p className="mb-4">Custom rows are blank layouts. You will need to add your own images and text.</p>
				<div>
					<CustomRowButton className="mb-4" title="Select Layout" onClick={handleOneColumnButtonClick} />
					<CustomRowButton
						className="mb-4"
						cols={2}
						title="Select Layout"
						onClick={handleTwoColumnButtonClick}
					/>
					<CustomRowButton cols={3} title="Select Layout" onClick={handleThreeColumnButtonClick} />
				</div>
			</CollapseButton>
		</>
	);
};
