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
	isMailingListRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isTagRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	MailingListRowModel,
	PageRowUnionModel,
	PageSectionDetailModel,
	ResourcesRowModel,
	TagGroupRowModel,
	TagRowModel,
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
			{ check: isTagRow, title: 'Tag' },
			{
				check: (row: PageRowUnionModel) =>
					isOneColumnImageRow(row) || isTwoColumnImageRow(row) || isThreeColumnImageRow(row),
				title: 'Custom Row',
			},
			{ check: isMailingListRow, title: 'Subscribe' },
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
			{
				check: isResourcesRow,
				getSubtitle: (row: ResourcesRowModel) =>
					`${row.contents.length} Resource${row.contents.length === 1 ? '' : 's'}`,
			},
			{
				check: isGroupSessionsRow,
				getSubtitle: (row: GroupSessionsRowModel) =>
					`${row.groupSessions.length} Session${row.groupSessions.length === 1 ? '' : 's'}`,
			},
			{ check: isTagGroupRow, getSubtitle: (row: TagGroupRowModel) => row.tagGroup.name },
			{ check: isTagRow, getSubtitle: (row: TagRowModel) => row.tag.name },
			{ check: isOneColumnImageRow, getSubtitle: () => '1 Item' },
			{ check: isTwoColumnImageRow, getSubtitle: () => '2 Items' },
			{ check: isThreeColumnImageRow, getSubtitle: () => '3 Items' },
			{ check: isMailingListRow, getSubtitle: (row: MailingListRowModel) => row.mailingListId },
		];

		for (const { check, getSubtitle } of rowTypeMap) {
			if (check(pageRow)) {
				return getSubtitle(pageRow as any);
			}
		}

		return '';
	};

	const debouncedSubmission = useDebouncedAsyncFunction(async (ps: PageSectionDetailModel, fv: typeof formValues) => {
		setIsSaving(true);

		try {
			const response = await pagesService
				.updatePageSection(ps.pageSectionId, {
					name: ps.name,
					headline: fv.headline,
					description: fv.description,
					backgroundColorId: fv.backgroundColor,
					displayOrder: ps.displayOrder,
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

		updatePageSection(pageSectionClone);
		setIsSaving(true);

		try {
			const { pageRows } = await pagesService
				.reorderPageSectionRows(currentPageSection.pageSectionId, {
					pageRowIds: pageSectionClone.pageRows.map((pr) => pr.pageRowId),
				})
				.fetch();

			pageSectionClone.pageRows = pageRows;
			updatePageSection(pageSectionClone);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (currentPageSection) {
					debouncedSubmission(currentPageSection, newValue);
				}

				return newValue;
			});
		},
		[currentPageSection, debouncedSubmission]
	);

	return (
		<>
			<CollapseButton title="Basics" initialShow>
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
