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
		columnOne: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
	});

	useEffect(() => {
		if (!oneColumnImageRow) {
			return;
		}

		setFormValues({
			columnOne: {
				headline: oneColumnImageRow.columnOne.headline ?? '',
				description: oneColumnImageRow.columnOne.description ?? '',
				imageFileUploadId: oneColumnImageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: oneColumnImageRow.columnOne.imageUrl ?? '',
				imageAltText: oneColumnImageRow.columnOne.imageAltText ?? '',
			},
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
					columnOne: fv.columnOne,
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
		(
			column: keyof typeof formValues,
			{ currentTarget }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
		) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[column]: {
						...previousValue[column],
						[currentTarget.name]: currentTarget.value,
					},
				};

				debouncedSubmission(newValue);
				return newValue;
			});
		},
		[debouncedSubmission]
	);

	const handleQuillChange = useCallback(
		(column: keyof typeof formValues, description: string) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[column]: {
						...previousValue[column],
						description,
					},
				};

				debouncedSubmission(newValue);
				return newValue;
			});
		},
		[debouncedSubmission]
	);

	const handleImageChange = useCallback(
		async (column: keyof typeof formValues, { nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			setFormValues((previousValue) => ({
				...previousValue,
				[column]: {
					...previousValue[column],
					imageFileUploadId: nextId,
					imageUrl: nextSrc,
				},
			}));

			setIsSaving(true);

			try {
				if (!oneColumnImageRow) {
					throw new Error('oneColumnImageRow is undefined.');
				}

				const response = await pagesService
					.updateOneColumnRow(oneColumnImageRow.pageRowId, {
						...formValues,
						[column]: {
							...formValues[column],
							imageFileUploadId: nextId,
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
		[formValues, handleError, oneColumnImageRow, setIsSaving, updatePageRow]
	);

	return (
		<>
			<CollapseButton title="Item 1" initialShow>
				<InputHelper
					className="mb-4"
					type="text"
					label="Headline"
					name="headline"
					value={formValues.columnOne.headline}
					onChange={(event) => {
						handleInputChange('columnOne', event);
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnOne.description}
						onChange={(value) => {
							handleQuillChange('columnOne', value);
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnOne.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							handleImageChange('columnOne', { nextId, nextSrc });
						}}
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
						value={formValues.columnOne.imageAltText}
						onChange={(event) => {
							handleInputChange('columnOne', event);
						}}
					/>
				</Form.Group>
			</CollapseButton>
		</>
	);
};
