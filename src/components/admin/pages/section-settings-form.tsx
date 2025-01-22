import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import {
	BACKGROUND_COLOR_ID,
	isGroupSessionsRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	PageRowModel,
	PageRowUnionModel,
	PageSectionDetailModel,
} from '@/lib/models';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { DraggableItem } from './draggable-item';

interface SectionSettingsFormProps {
	pageSection: PageSectionDetailModel;
	onAddRowButtonClick(): void;
	onRowButtonClick(pageRow: PageRowModel): void;
}

export const SectionSettingsForm = ({
	pageSection,
	onAddRowButtonClick,
	onRowButtonClick,
}: SectionSettingsFormProps) => {
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

	const getTitleForPageRow = (pageRow: PageRowUnionModel) => {
		if (isResourcesRow(pageRow)) {
			return 'Resources';
		}

		if (isGroupSessionsRow(pageRow)) {
			return 'Group Sessions';
		}

		if (isTagGroupRow(pageRow)) {
			return 'Tag Group';
		}

		if (isOneColumnImageRow(pageRow) || isTwoColumnImageRow(pageRow) || isThreeColumnImageRow(pageRow)) {
			return 'Custom Row';
		}

		return '';
	};

	const getSubTitleForPageRow = (pageRow: PageRowUnionModel) => {
		if (isResourcesRow(pageRow)) {
			return `${pageRow.contents.length} Resources`;
		}

		if (isGroupSessionsRow(pageRow)) {
			return `${pageRow.groupSessions.length} Sessions`;
		}

		if (isTagGroupRow(pageRow)) {
			return `TODO: ${pageRow.tagGroup.tagGroupId}`;
		}

		if (isOneColumnImageRow(pageRow)) {
			return '1 Item';
		}

		if (isTwoColumnImageRow(pageRow)) {
			return '2 Items';
		}

		if (isThreeColumnImageRow(pageRow)) {
			return '3 Items';
		}

		return '';
	};

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
			<DragDropContext
				onDragEnd={() => {
					window.alert('[TODO]: DropEnd for Rows');
				}}
			>
				<Droppable droppableId="page-rows-droppable" direction="vertical">
					{(droppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							{pageSection.pageRows.map((pageRow, sectionIndex) => (
								<Draggable
									key={pageRow.pageRowId}
									draggableId={`page-rows-draggable-${pageRow.pageRowId}`}
									index={sectionIndex}
								>
									{(draggableProvided, draggableSnapshot) => (
										<DraggableItem
											key={pageRow.pageRowId}
											draggableProvided={draggableProvided}
											draggableSnapshot={draggableSnapshot}
											onClick={() => onRowButtonClick(pageRow)}
											title={getTitleForPageRow(pageRow)}
											subTitle={getSubTitleForPageRow(pageRow)}
										/>
									)}
								</Draggable>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</>
	);
};
