import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ThreeColumnImageRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';

export const RowSettingsThreeColumns = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const threeColumnImageRow = useMemo(() => currentPageRow as ThreeColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		columnOne: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
		columnTwo: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
		columnThree: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
	});

	useEffect(() => {
		if (!threeColumnImageRow) {
			return;
		}

		setFormValues({
			columnOne: {
				headline: threeColumnImageRow.columnOne.headline ?? '',
				description: threeColumnImageRow.columnOne.description ?? '',
				imageFileUploadId: threeColumnImageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: threeColumnImageRow.columnOne.imageUrl ?? '',
				imageAltText: threeColumnImageRow.columnOne.imageAltText ?? '',
			},
			columnTwo: {
				headline: threeColumnImageRow.columnTwo.headline ?? '',
				description: threeColumnImageRow.columnTwo.description ?? '',
				imageFileUploadId: threeColumnImageRow.columnTwo.imageFileUploadId ?? '',
				imageUrl: threeColumnImageRow.columnTwo.imageUrl ?? '',
				imageAltText: threeColumnImageRow.columnTwo.imageAltText ?? '',
			},
			columnThree: {
				headline: threeColumnImageRow.columnThree.headline ?? '',
				description: threeColumnImageRow.columnThree.description ?? '',
				imageFileUploadId: threeColumnImageRow.columnThree.imageFileUploadId ?? '',
				imageUrl: threeColumnImageRow.columnThree.imageUrl ?? '',
				imageAltText: threeColumnImageRow.columnThree.imageAltText ?? '',
			},
		});
	}, [threeColumnImageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateThreeColumnRow(currentPageRow.pageRowId, {
					columnOne: fv.columnOne,
					columnTwo: fv.columnTwo,
					columnThree: fv.columnThree,
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
				if (!threeColumnImageRow) {
					throw new Error('threeColumnImageRow is undefined.');
				}

				const response = await pagesService
					.updateThreeColumnRow(threeColumnImageRow.pageRowId, {
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
		[formValues, handleError, setIsSaving, threeColumnImageRow, updatePageRow]
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
								filename: name,
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
								filename: name,
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
			<hr />
			<CollapseButton title="Item 3" initialShow>
				<InputHelper
					className="mb-4"
					type="text"
					label="Headline"
					name="headline"
					value={formValues.columnThree.headline}
					onChange={(event) => {
						handleInputChange('columnThree', event);
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnThree.description}
						onChange={(value) => {
							handleQuillChange('columnThree', value);
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnThree.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							handleImageChange('columnThree', { nextId, nextSrc });
						}}
						onUploadComplete={(fileUploadId) => {
							handleUploadComplete('columnThree', fileUploadId);
						}}
						presignedUploadGetter={(blob, name) => {
							return pagesService.createPresignedFileUpload({
								contentType: blob.type,
								filename: name,
							}).fetch;
						}}
					/>
					<InputHelper
						type="text"
						label="Image alt text"
						name="imageAltText"
						value={formValues.columnThree.imageAltText}
						onChange={(event) => {
							handleInputChange('columnThree', event);
						}}
					/>
				</Form.Group>
			</CollapseButton>
		</>
	);
};
