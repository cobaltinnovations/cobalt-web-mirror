import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { TwoColumnImageRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';

export const RowSettingsTwoColumns = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const twoColumnImageRow = useMemo(() => currentPageRow as TwoColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		columnOne: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
		columnTwo: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
	});

	useEffect(() => {
		if (!twoColumnImageRow) {
			return;
		}

		setFormValues({
			columnOne: {
				headline: twoColumnImageRow.columnOne.headline ?? '',
				description: twoColumnImageRow.columnOne.description ?? '',
				imageFileUploadId: twoColumnImageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: twoColumnImageRow.columnOne.imageUrl ?? '',
				imageAltText: twoColumnImageRow.columnOne.imageAltText ?? '',
			},
			columnTwo: {
				headline: twoColumnImageRow.columnTwo.headline ?? '',
				description: twoColumnImageRow.columnTwo.description ?? '',
				imageFileUploadId: twoColumnImageRow.columnTwo.imageFileUploadId ?? '',
				imageUrl: twoColumnImageRow.columnTwo.imageUrl ?? '',
				imageAltText: twoColumnImageRow.columnTwo.imageAltText ?? '',
			},
		});
	}, [twoColumnImageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateTwoColumnRow(currentPageRow.pageRowId, {
					columnOne: fv.columnOne,
					columnTwo: fv.columnTwo,
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

	const handleUploadComplete = useCallback(
		async (column: keyof typeof formValues, imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				if (!twoColumnImageRow) {
					throw new Error('twoColumnImageRow is undefined.');
				}

				const response = await pagesService
					.updateTwoColumnRow(twoColumnImageRow.pageRowId, {
						...formValues,
						[column]: {
							...formValues[column],
							imageFileUploadId,
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
		[formValues, handleError, setIsSaving, twoColumnImageRow, updatePageRow]
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

			if (!nextId && !nextSrc) {
				handleUploadComplete(column, '');
			}
		},
		[handleUploadComplete]
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
						onUploadComplete={(fileUploadId) => {
							handleUploadComplete('columnOne', fileUploadId);
						}}
						presignedUploadGetter={(blob, name) => {
							return pagesService.createPresignedFileUpload({
								contentType: blob.type,
								filename: name ?? `${uuidv4()}.jpg`,
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
			<hr />
			<CollapseButton title="Item 2" initialShow>
				<InputHelper
					className="mb-4"
					type="text"
					label="Headline"
					name="headline"
					value={formValues.columnTwo.headline}
					onChange={(event) => {
						handleInputChange('columnTwo', event);
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnTwo.description}
						onChange={(value) => {
							handleQuillChange('columnTwo', value);
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnTwo.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							handleImageChange('columnTwo', { nextId, nextSrc });
						}}
						onUploadComplete={(fileUploadId) => {
							handleUploadComplete('columnTwo', fileUploadId);
						}}
						presignedUploadGetter={(blob, name) => {
							return pagesService.createPresignedFileUpload({
								contentType: blob.type,
								filename: name ?? `${uuidv4()}.jpg`,
							}).fetch;
						}}
					/>
					<InputHelper
						type="text"
						label="Image alt text"
						name="imageAltText"
						value={formValues.columnTwo.imageAltText}
						onChange={(event) => {
							handleInputChange('columnTwo', event);
						}}
					/>
				</Form.Group>
			</CollapseButton>
		</>
	);
};
