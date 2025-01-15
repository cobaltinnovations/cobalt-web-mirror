import React from 'react';
import { Button } from 'react-bootstrap';
import { CollapseButton } from './collapse-button';

interface RowSelectionFormProps {
	onSelection(): void;
}

export const RowSelectionForm = ({ onSelection }: RowSelectionFormProps) => {
	return (
		<>
			<CollapseButton title="Content Row" initialShow>
				<div className="pb-6">
					<p>Use a content row to add existing content from Cobalt.</p>
					<div className="d-flex">
						<Button className="me-1 flex-fill" onClick={onSelection}>
							Resources
						</Button>
						<Button className="mx-1 flex-fill" onClick={onSelection}>
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
