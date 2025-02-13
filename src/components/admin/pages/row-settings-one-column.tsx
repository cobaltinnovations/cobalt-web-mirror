import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { OneColumnImageRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';

export const RowSettingsOneColumn = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const oneColumnImageRow = useMemo(() => currentPageRow as OneColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});

	useEffect(() => {
		if (!oneColumnImageRow) {
			return;
		}

		setFormValues({
			headline: oneColumnImageRow.columnOne.headline,
			description: oneColumnImageRow.columnOne.description,
			imageFileUploadId: oneColumnImageRow.columnOne.imageFileUploadId,
			imageUrl: oneColumnImageRow.columnOne.imageUrl,
			imageAltText: oneColumnImageRow.columnOne.imageAltText,
		});
	}, [oneColumnImageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!oneColumnImageRow) {
				throw new Error('oneColumnImageRow is undefined.');
			}

			const response = await pagesService
				.updateOneColumnRow(oneColumnImageRow.pageRowId, {
					columnOne: {
						headline: fv.headline,
						description: fv.description,
						imageFileUploadId: fv.imageFileUploadId,
						imageAltText: fv.imageAltText,
					},
				})
				.fetch();

			updatePageRow(response.pageRow);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

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

	const handleQuillChange = useCallback(
		(value: string) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					description: value,
				};

				debouncedSubmission(newValue);
				return newValue;
			});
		},
		[debouncedSubmission]
	);

	const handleImageChange = useCallback(
		async (nextId: string, nextSrc: string) => {
			setFormValues((previousValue) => ({
				...previousValue,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			}));

			setIsSaving(true);

			try {
				if (!oneColumnImageRow) {
					throw new Error('oneColumnImageRow is undefined.');
				}

				const response = await pagesService
					.updateOneColumnRow(oneColumnImageRow.pageRowId, {
						columnOne: {
							headline: formValues.headline,
							description: formValues.description,
							imageFileUploadId: nextId,
							imageAltText: formValues.imageAltText,
						},
					})
					.fetch();

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[oneColumnImageRow, formValues, handleError, setIsSaving, updatePageRow]
	);

	return (
		<>
			<CollapseButton title="Item 1" initialShow>
				<InputHelper
					className="mb-4"
					type="text"
					label="Headline"
					name="headline"
					value={formValues.headline}
					onChange={handleInputChange}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic height={228} value={formValues.description} onChange={handleQuillChange} />
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.imageUrl}
						onSrcChange={handleImageChange}
						presignedUploadGetter={(blob) => {
							return pagesService.createPresignedFileUpload({
								contentType: blob.type,
								filename: `${uuidv4()}.jpg`,
							}).fetch;
						}}
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
		</>
	);
};
