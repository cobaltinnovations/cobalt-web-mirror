import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { CustomRowModel, isCustomRow } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';

interface RowSettingsCustomRowColumnProps {
	pageRowColumnId: string;
}

export const RowSettingsCustomRowColumn = ({ pageRowColumnId }: RowSettingsCustomRowColumnProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const pageRow = useMemo(
		() => (currentPageRow && isCustomRow(currentPageRow) ? currentPageRow : undefined),
		[currentPageRow]
	);
	const pageRowColumn = useMemo(
		() => pageRow?.columns.find((column) => column.pageRowColumnId === pageRowColumnId),
		[pageRow, pageRowColumnId]
	);
	const [formValues, setFormValues] = useState({
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});

	useEffect(() => {
		if (!pageRowColumn) {
			return;
		}

		setFormValues({
			description: pageRowColumn.description ?? '',
			imageFileUploadId: pageRowColumn.imageFileUploadId ?? '',
			imageUrl: pageRowColumn.imageUrl ?? '',
			imageAltText: pageRowColumn.imageAltText ?? '',
		});
	}, [pageRowColumn]);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (pr: CustomRowModel, prcId: string, fv: typeof formValues) => {
			setIsSaving(true);

			try {
				const { pageRow: updatedPageRow } = await pagesService
					.updateCustomRowColumn(pr.pageRowId, prcId, {
						description: fv.description,
						imageFileUploadId: fv.imageFileUploadId,
						imageAltText: fv.imageAltText,
					})
					.fetch();

				updatePageRow(updatedPageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (pageRow && pageRowColumn) {
					debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
				}

				return nextValue;
			});
		},
		[debouncedSubmission, pageRow, pageRowColumn]
	);

	const handleQuillChange = useCallback(
		(description: string) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					description,
				};

				if (pageRow && pageRowColumn) {
					debouncedSubmission(pageRow, pageRowColumn.pageRowColumnId, nextValue);
				}

				return nextValue;
			});
		},
		[debouncedSubmission, pageRow, pageRowColumn]
	);

	const handleUploadComplete = useCallback(
		async (imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				if (!pageRow || !pageRowColumn) {
					throw new Error('pageRow or pageRowColumn is undefined.');
				}

				const nextValue = {
					...formValues,
					imageFileUploadId,
				};
				const { pageRow: updatedPageRow } = await pagesService
					.updateCustomRowColumn(pageRow.pageRowId, pageRowColumn.pageRowColumnId, {
						description: nextValue.description,
						imageFileUploadId: nextValue.imageFileUploadId,
						imageAltText: nextValue.imageAltText,
					})
					.fetch();

				updatePageRow(updatedPageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[formValues, handleError, pageRow, pageRowColumn, setIsSaving, updatePageRow]
	);

	const handleImageChange = useCallback(
		({ nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			setFormValues((previousValue) => ({
				...previousValue,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			}));

			if (!nextId && !nextSrc) {
				handleUploadComplete('');
			}
		},
		[handleUploadComplete]
	);

	if (!pageRow || !pageRowColumn) {
		return null;
	}

	return (
		<>
			<CollapseButton title="Image" initialShow>
				<Form.Group className="mb-6">
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							handleImageChange({ nextId, nextSrc });
						}}
						onUploadComplete={handleUploadComplete}
						presignedUploadGetter={(blob, name) => {
							return pagesService.createPresignedFileUpload({
								contentType: blob.type,
								filename: name,
							}).fetch;
						}}
						cropImage={false}
					/>
					<InputHelper
						type="text"
						label="Image alt text"
						name="imageAltText"
						value={formValues.imageAltText}
						onChange={handleInputChange}
					/>
				</Form.Group>
			</CollapseButton>
			<CollapseButton title="Text" initialShow>
				<Form.Group className="mb-0">
					<WysiwygBasic
						height={420}
						value={formValues.description}
						onChange={(value) => {
							handleQuillChange(value);
						}}
					/>
				</Form.Group>
			</CollapseButton>
		</>
	);
};
