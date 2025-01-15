import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';

interface SectionSettingsFormProps {
	onAddRow(): void;
}

export const SectionSettingsForm = ({ onAddRow }: SectionSettingsFormProps) => {
	return (
		<>
			<CollapseButton title="Basics" initialShow>
				<Form>
					<InputHelper className="mb-4" type="text" label="Headline" />
					<InputHelper className="mb-4" as="textarea" label="Description" />
					<Form.Group className="mb-6">
						<Form.Label className="mb-2">Background color</Form.Label>
						<Form.Check type="radio" name="background-color" id="background-color--white" label="White" />
						<Form.Check
							type="radio"
							name="background-color"
							id="background-color--neutral"
							label="Neutral"
						/>
					</Form.Group>
				</Form>
			</CollapseButton>
			<hr />
			<Form.Group className="py-6 d-flex align-items-center justify-content-between">
				<h5 className="mb-0">Rows</h5>
				<Button type="button" size="sm" onClick={onAddRow}>
					Add Row
				</Button>
			</Form.Group>
			<NoData
				title="No rows added"
				actions={[
					{
						variant: 'primary',
						title: 'Add row',
						onClick: onAddRow,
					},
				]}
			/>
		</>
	);
};
