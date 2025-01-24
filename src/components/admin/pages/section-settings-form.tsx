import { cloneDeep } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import {
	BACKGROUND_COLOR_ID,
	GroupSessionsRowModel,
	isGroupSessionsRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	PageRowModel,
	PageRowUnionModel,
	ResourcesRowModel,
	TagGroupRowModel,
} from '@/lib/models';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableItem } from './draggable-item';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

interface SectionSettingsFormProps {
	onAddRowButtonClick(): void;
	onRowButtonClick(pageRow: PageRowModel): void;
}

export const SectionSettingsForm = ({ onAddRowButtonClick, onRowButtonClick }: SectionSettingsFormProps) => {
	const handleError = useHandleError();
	const { currentPageSection, updatePageSection, setIsSaving } = usePageBuilderContext();
	const headlineInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		backgroundColor: BACKGROUND_COLOR_ID.WHITE,
	});

	useEffect(() => {
		headlineInputRef.current?.focus();

		setFormValues({
			headline: currentPageSection?.headline ?? '',
			description: currentPageSection?.description ?? '',
			backgroundColor: currentPageSection?.backgroundColorId ?? BACKGROUND_COLOR_ID.WHITE,
		});
	}, [currentPageSection?.backgroundColorId, currentPageSection?.description, currentPageSection?.headline]);

	const getTitleForPageRow = (pageRow: PageRowUnionModel) => {
		const rowTypeMap = [
			{ check: isResourcesRow, title: 'Resources' },
			{ check: isGroupSessionsRow, title: 'Group Sessions' },
			{ check: isTagGroupRow, title: 'Tag Group' },
			{
				check: (row: PageRowUnionModel) =>
					isOneColumnImageRow(row) || isTwoColumnImageRow(row) || isThreeColumnImageRow(row),
				title: 'Custom Row',
			},
		];

		for (const { check, title } of rowTypeMap) {
			if (check(pageRow)) {
				return title;
			}
		}

		return '';
	};

	const getSubTitleForPageRow = (pageRow: PageRowUnionModel) => {
		const rowTypeMap = [
			{ check: isResourcesRow, getSubtitle: (row: ResourcesRowModel) => `${row.contents.length} Resources` },
			{
				check: isGroupSessionsRow,
				getSubtitle: (row: GroupSessionsRowModel) => `${row.groupSessions.length} Sessions`,
			},
			{ check: isTagGroupRow, getSubtitle: (row: TagGroupRowModel) => row.tagGroup.name },
			{ check: isOneColumnImageRow, getSubtitle: () => '1 Item' },
			{ check: isTwoColumnImageRow, getSubtitle: () => '2 Items' },
			{ check: isThreeColumnImageRow, getSubtitle: () => '3 Items' },
		];

		for (const { check, getSubtitle } of rowTypeMap) {
			if (check(pageRow)) {
				return getSubtitle(pageRow as any);
			}
		}

		return '';
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined');
			}

			const response = await pagesService
				.updatePageSection(currentPageSection.pageSectionId, {
					name: currentPageSection.name,
					headline: formValues.headline,
					description: formValues.description,
					backgroundColorId: formValues.backgroundColor,
					displayOrder: currentPageSection.displayOrder,
				})
				.fetch();

			updatePageSection(response.pageSection);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDragEnd = async ({ source, destination }: DropResult) => {
		if (!destination) {
			return;
		}

		if (!currentPageSection) {
			return;
		}

		const pageSectionClone = cloneDeep(currentPageSection);
		const [removedContent] = pageSectionClone.pageRows.splice(source.index, 1);
		pageSectionClone.pageRows.splice(destination.index, 0, removedContent);

		window.alert('[TODO]: API call to reorder rows');
		updatePageSection(pageSectionClone);
	};

	return (
		<>
			<CollapseButton title="Basics" initialShow>
				<Form onSubmit={handleFormSubmit}>
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
					<Button type="submit" variant="warning" className="mb-4">
						Temp Submit Button (No live saving yet)
					</Button>
				</Form>
			</CollapseButton>
			<hr />
			<Form.Group className="py-6 d-flex align-items-center justify-content-between">
				<h5 className="mb-0">Rows</h5>
				<Button type="button" size="sm" onClick={onAddRowButtonClick}>
					Add Row
				</Button>
			</Form.Group>
			{(currentPageSection?.pageRows ?? []).length === 0 && (
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
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId="page-rows-droppable" direction="vertical">
					{(droppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							{(currentPageSection?.pageRows ?? []).map((pageRow, sectionIndex) => (
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
