import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
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
	PageRowUnionModel,
	ResourcesRowModel,
	TagGroupRowModel,
} from '@/lib/models';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { DraggableItem } from './draggable-item';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';

interface SectionSettingsFormProps {
	onAddRowButtonClick(): void;
	onRowButtonClick(pageRow: PageRowUnionModel): void;
}

export const SectionSettingsForm = ({ onAddRowButtonClick, onRowButtonClick }: SectionSettingsFormProps) => {
	const handleError = useHandleError();
	const { currentPageSection, updatePageSection, setIsSaving } = usePageBuilderContext();
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		backgroundColor: BACKGROUND_COLOR_ID.WHITE,
	});

	useEffect(() => {
		if (!currentPageSection) {
			return;
		}

		setFormValues({
			headline: currentPageSection.headline ?? '',
			description: currentPageSection.description ?? '',
			backgroundColor: currentPageSection.backgroundColorId ?? '',
		});
	}, [currentPageSection]);

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

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!currentPageSection) {
				throw new Error('currentPageSection is undefined');
			}

			const response = await pagesService
				.updatePageSection(currentPageSection.pageSectionId, {
					name: currentPageSection.name,
					headline: fv.headline,
					description: fv.description,
					backgroundColorId: fv.backgroundColor,
					displayOrder: currentPageSection.displayOrder,
				})
				.fetch();

			updatePageSection(response.pageSection);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

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

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				debouncedSubmission(newValue);
				return newValue;
			});
		},
		[debouncedSubmission]
	);

	return (
		<>
			<CollapseButton title="Basics" initialShow>
				<Form>
					<InputHelper
						className="mb-4"
						type="text"
						label="Headline"
						name="headline"
						value={formValues.headline}
						onChange={handleInputChange}
					/>
					<InputHelper
						className="mb-4"
						as="textarea"
						label="Description"
						name="description"
						value={formValues.description}
						onChange={handleInputChange}
					/>
					<Form.Group className="mb-6">
						<Form.Label className="mb-2">Background color</Form.Label>
						<Form.Check
							type="radio"
							id="background-color--white"
							label="White"
							name="backgroundColor"
							value={BACKGROUND_COLOR_ID.WHITE}
							checked={formValues.backgroundColor === BACKGROUND_COLOR_ID.WHITE}
							onChange={handleInputChange}
						/>
						<Form.Check
							type="radio"
							id="background-color--neutral"
							label="Neutral"
							name="backgroundColor"
							value={BACKGROUND_COLOR_ID.NEUTRAL}
							checked={formValues.backgroundColor === BACKGROUND_COLOR_ID.NEUTRAL}
							onChange={handleInputChange}
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
