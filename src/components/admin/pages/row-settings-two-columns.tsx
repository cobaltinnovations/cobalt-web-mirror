import React from 'react';
import { Form } from 'react-bootstrap';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';

export const RowSettingsTwoColumns = () => {
	return (
		<>
			<CollapseButton title="Item 1" initialShow>
				<InputHelper className="mb-4" type="text" label="Headline" />
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={''}
						onChange={() => {
							throw new Error('Function not implemented.');
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<InputHelper type="text" label="Image alt text" />
				</Form.Group>
			</CollapseButton>
			<hr />
			<CollapseButton title="Item 2" initialShow>
				<InputHelper className="mb-4" type="text" label="Headline" />
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={''}
						onChange={() => {
							throw new Error('Function not implemented.');
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<InputHelper type="text" label="Image alt text" />
				</Form.Group>
			</CollapseButton>
		</>
	);
};
