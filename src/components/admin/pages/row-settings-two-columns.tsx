import React, { RefObject, useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ROW_TYPE_ID, TwoColumnRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { RowSettingsMetaForm } from '@/components/admin/pages';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';

interface RowSettingsTwoColumnsProps {
	nameInputRef?: RefObject<HTMLInputElement>;
	pageRow: TwoColumnRowModel;
}

type TwoColumnFormValues = {
	columnOne: {
		headline: string;
		description: string;
		imageFileUploadId: string;
		imageUrl: string;
		imageAltText: string;
	};
	columnTwo: {
		headline: string;
		description: string;
		imageFileUploadId: string;
		imageUrl: string;
		imageAltText: string;
	};
};

const persistTwoColumnRow = (pageRow: TwoColumnRowModel, formValues: TwoColumnFormValues) => {
	const data = { columnOne: formValues.columnOne, columnTwo: formValues.columnTwo };

	switch (pageRow.rowTypeId) {
		case ROW_TYPE_ID.TWO_COLUMN_IMAGE:
			return pagesService.updateTwoColumnRow(pageRow.pageRowId, data).fetch();
		case ROW_TYPE_ID.TWO_COLUMN_TEXT:
			return pagesService.updateTwoColumnTextRow(pageRow.pageRowId, data).fetch();
		default: {
			const unsupportedRowType: never = pageRow.rowTypeId;
			throw new Error(`Unsupported two-column row type: ${unsupportedRowType}`);
		}
	}
};

export const RowSettingsTwoColumns = ({ nameInputRef, pageRow }: RowSettingsTwoColumnsProps) => {
	const handleError = useHandleError();
	const { updatePageRow, setIsSaving } = usePageBuilderContext();
	const isTextRow = pageRow.rowTypeId === ROW_TYPE_ID.TWO_COLUMN_TEXT;
	const [formValues, setFormValues] = useState<TwoColumnFormValues>({
		columnOne: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
		columnTwo: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
	});

	useEffect(() => {
		setFormValues({
			columnOne: {
				headline: pageRow.columnOne.headline ?? '',
				description: pageRow.columnOne.description ?? '',
				imageFileUploadId: pageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: pageRow.columnOne.imageUrl ?? '',
				imageAltText: pageRow.columnOne.imageAltText ?? '',
			},
			columnTwo: {
				headline: pageRow.columnTwo.headline ?? '',
				description: pageRow.columnTwo.description ?? '',
				imageFileUploadId: pageRow.columnTwo.imageFileUploadId ?? '',
				imageUrl: pageRow.columnTwo.imageUrl ?? '',
				imageAltText: pageRow.columnTwo.imageAltText ?? '',
			},
		});
	}, [pageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (twoColumnRow: TwoColumnRowModel, fv: TwoColumnFormValues) => {
			setIsSaving(true);

			try {
				const response = await persistTwoColumnRow(twoColumnRow, fv);

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	useEffect(() => {
		return () => {
			void debouncedSubmission.flush();
		};
	}, [debouncedSubmission]);

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

				debouncedSubmission(pageRow, newValue);

				return newValue;
			});
		},
		[debouncedSubmission, pageRow]
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

				debouncedSubmission(pageRow, newValue);
				return newValue;
			});
		},
		[debouncedSubmission, pageRow]
	);

	const handleUploadComplete = useCallback(
		async (column: keyof typeof formValues, imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				const nextValue = {
					...formValues,
					[column]: {
						...formValues[column],
						imageFileUploadId,
					},
				};
				debouncedSubmission.cancel();
				const response = await persistTwoColumnRow(pageRow, nextValue);

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[debouncedSubmission, formValues, handleError, pageRow, setIsSaving, updatePageRow]
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
			<RowSettingsMetaForm nameInputRef={nameInputRef} pageRow={pageRow} />
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
						toolbarPreset="page-builder"
						height={228}
						value={formValues.columnOne.description}
						onChange={(value) => {
							handleQuillChange('columnOne', value);
						}}
					/>
				</Form.Group>
				{!isTextRow && (
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
				)}
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
						toolbarPreset="page-builder"
						height={228}
						value={formValues.columnTwo.description}
						onChange={(value) => {
							handleQuillChange('columnTwo', value);
						}}
					/>
				</Form.Group>
				{!isTextRow && (
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
				)}
			</CollapseButton>
		</>
	);
};
