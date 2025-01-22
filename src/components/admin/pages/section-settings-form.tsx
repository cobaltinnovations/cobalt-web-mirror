import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import { BACKGROUND_COLOR_ID, PageSectionDetailModel } from '@/lib/models';

interface SectionSettingsFormProps {
	pageSection: PageSectionDetailModel;
	onAddRowButtonClick(): void;
}

export const SectionSettingsForm = ({ pageSection, onAddRowButtonClick }: SectionSettingsFormProps) => {
	const headlineInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		backgroundColor: BACKGROUND_COLOR_ID.WHITE,
		rows: [],
	});

	useEffect(() => {
		headlineInputRef.current?.focus();
	}, []);

	return (
		<>
			<CollapseButton title="Basics" initialShow>
				<Form>
					<InputHelper
						ref={headlineInputRef}
						className="mb-4"
						type="text"
						label="Headline"
						value={formValues.headline}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								headline: currentTarget.value,
							}));
						}}
					/>
					<InputHelper
						className="mb-4"
						as="textarea"
						label="Description"
						value={formValues.description}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								description: currentTarget.value,
							}));
						}}
					/>
					<Form.Group className="mb-6">
						<Form.Label className="mb-2">Background color</Form.Label>
						<Form.Check
							type="radio"
							name="background-color"
							id="background-color--white"
							label="White"
							value={BACKGROUND_COLOR_ID.WHITE}
							checked={formValues.backgroundColor === BACKGROUND_COLOR_ID.WHITE}
							onChange={() => {
								setFormValues((previousValue) => ({
									...previousValue,
									backgroundColor: BACKGROUND_COLOR_ID.WHITE,
								}));
							}}
						/>
						<Form.Check
							type="radio"
							name="background-color"
							id="background-color--neutral"
							label="Neutral"
							value={BACKGROUND_COLOR_ID.NEUTRAL}
							checked={formValues.backgroundColor === BACKGROUND_COLOR_ID.NEUTRAL}
							onChange={() => {
								setFormValues((previousValue) => ({
									...previousValue,
									backgroundColor: BACKGROUND_COLOR_ID.NEUTRAL,
								}));
							}}
						/>
					</Form.Group>
				</Form>
			</CollapseButton>
			<hr />
			<Form.Group className="py-6 d-flex align-items-center justify-content-between">
				<h5 className="mb-0">Rows</h5>
				<Button type="button" size="sm" onClick={onAddRowButtonClick}>
					Add Row
				</Button>
			</Form.Group>
			{pageSection.pageRows.length === 0 && (
				<NoData
					title="No rows added"
					actions={[
						{
							variant: 'primary',
							title: 'Add row',
							onClick: onAddRowButtonClick,
						},
					]}
				/>
			)}
			{pageSection.pageRows.map((pageRow) => (
				<div>{pageRow.pageRowId}</div>
			))}
		</>
	);
};
