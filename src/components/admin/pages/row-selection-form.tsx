import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { CollapseButton, CustomRowButton, SelectResourcesModal } from '@/components/admin/pages';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import {
	OneColumnImageRowModel,
	ResourcesRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';

interface RowSelectionFormProps {
	pageSectionId: string;
	onResourcesRowAdded(pageRow: ResourcesRowModel): void;
	onOneColumnRowAdded(pageRow: OneColumnImageRowModel): void;
	onTwoColumnRowAdded(pageRow: TwoColumnImageRowModel): void;
	onThreeColumnRowAdded(pageRow: ThreeColumnImageRowModel): void;
}

export const RowSelectionForm = ({
	pageSectionId,
	onResourcesRowAdded,
	onOneColumnRowAdded,
	onTwoColumnRowAdded,
	onThreeColumnRowAdded,
}: RowSelectionFormProps) => {
	const handleError = useHandleError();
	const [showSelectResourcesModal, setShowSelectResourcesModal] = useState(false);

	const handleResourcesAdd = async (contentIds: string[]) => {
		try {
			const response = await pagesService.createResourcesRow(pageSectionId, { contentIds }).fetch();

			setShowSelectResourcesModal(false);
			onResourcesRowAdded(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	const handleOneColumnButtonClick = async () => {
		try {
			const response = await pagesService.createOneColumnRow(pageSectionId).fetch();
			onOneColumnRowAdded(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	const handleTwoColumnButtonClick = async () => {
		try {
			const response = await pagesService.createTwoColumnRow(pageSectionId).fetch();
			onTwoColumnRowAdded(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	const handleThreeColumnButtonClick = async () => {
		try {
			const response = await pagesService.createThreeColumnRow(pageSectionId).fetch();
			onThreeColumnRowAdded(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<>
			<SelectResourcesModal
				show={showSelectResourcesModal}
				onAdd={handleResourcesAdd}
				onHide={() => {
					setShowSelectResourcesModal(false);
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
								window.alert('[TODO]: Group sessions modal');
							}}
						>
							Group Sessions
						</Button>
						<Button
							className="ms-1 flex-fill"
							onClick={() => {
								window.alert('[TODO]: Tag group modal');
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
