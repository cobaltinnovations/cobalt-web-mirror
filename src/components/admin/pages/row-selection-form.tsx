import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { CollapseButton } from './collapse-button';
import { SelectResourcesModal } from './select-resources-modal';

interface RowSelectionFormProps {
	onSelection(): void;
}

export const RowSelectionForm = ({ onSelection }: RowSelectionFormProps) => {
	const [showSelectResourcesModal, setShowSelectResourcesModal] = useState(false);
	const [showSelectGroupSessionsModal, setShowSelectGroupSessionsModal] = useState(false);

	return (
		<>
			<SelectResourcesModal
				show={showSelectResourcesModal}
				onAdd={() => {
					onSelection();
					setShowSelectResourcesModal(false);
				}}
				onHide={() => {
					setShowSelectResourcesModal(false);
				}}
			/>

			<SelectResourcesModal
				show={showSelectGroupSessionsModal}
				onAdd={() => {
					onSelection();
					setShowSelectGroupSessionsModal(false);
				}}
				onHide={() => {
					setShowSelectGroupSessionsModal(false);
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
						<Button className="ms-1 flex-fill" onClick={onSelection}>
							Tag Group
						</Button>
					</div>
				</div>
			</CollapseButton>
			<hr />
			<CollapseButton title="Custom Row" initialShow>
				<p>Custom rows are blank layouts. You will need to add your own images and text.</p>
				<div>
					<Button className="mb-2 d-block w-100" onClick={onSelection}>
						One Col
					</Button>
					<Button className="mb-2 d-block w-100" onClick={onSelection}>
						Two Cols
					</Button>
					<Button className="d-block w-100" onClick={onSelection}>
						Three Cols
					</Button>
				</div>
			</CollapseButton>
		</>
	);
};
