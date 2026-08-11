import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ImageModel, OneColumnRowModel, ROW_TYPE_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { RowSettingsMetaForm } from '@/components/admin/pages';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { AdminFormImageInputV2 } from '@/components/admin/admin-form-image-input-v2';
import useAccount from '@/hooks/use-account';
import { getPageBuilderImageAssociationRequest } from './page-builder-image';

interface RowSettingsOneColumnProps {
	nameInputRef?: RefObject<HTMLInputElement>;
	pageRow: OneColumnRowModel;
}

type OneColumnFormValues = {
	columnOne: {
		headline: string;
		description: string;
		image?: ImageModel;
		imageFileUploadId: string;
		imageUrl: string;
		imageAltText: string;
	};
};

const persistOneColumnRow = (
	pageRow: OneColumnRowModel,
	formValues: OneColumnFormValues,
	imageRepositoryEnabled: boolean
) => {
	const { headline, description, imageAltText } = formValues.columnOne;
	const data = {
		columnOne: {
			headline,
			description,
			imageAltText,
			...getPageBuilderImageAssociationRequest(formValues.columnOne, imageRepositoryEnabled),
		},
	};

	switch (pageRow.rowTypeId) {
		case ROW_TYPE_ID.ONE_COLUMN_IMAGE:
			return pagesService.updateOneColumnRow(pageRow.pageRowId, data).fetch();
		case ROW_TYPE_ID.ONE_COLUMN_IMAGE_RIGHT:
			return pagesService.updateOneColumnImageRightRow(pageRow.pageRowId, data).fetch();
		case ROW_TYPE_ID.ONE_COLUMN_TEXT:
			return pagesService.updateOneColumnTextRow(pageRow.pageRowId, data).fetch();
		default: {
			const unsupportedRowType: never = pageRow.rowTypeId;
			throw new Error(`Unsupported one-column row type: ${unsupportedRowType}`);
		}
	}
};

export const RowSettingsOneColumn = ({ nameInputRef, pageRow }: RowSettingsOneColumnProps) => {
	const handleError = useHandleError();
	const { institution } = useAccount();
	const { updatePageRow, setIsSaving } = usePageBuilderContext();
	const isTextRow = pageRow.rowTypeId === ROW_TYPE_ID.ONE_COLUMN_TEXT;
	const [formValues, setFormValues] = useState<OneColumnFormValues>({
		columnOne: {
			headline: '',
			description: '',
			image: undefined,
			imageFileUploadId: '',
			imageUrl: '',
			imageAltText: '',
		},
	});
	const formValuesRef = useRef(formValues);

	useEffect(() => {
		const nextValues: OneColumnFormValues = {
			columnOne: {
				headline: pageRow.columnOne.headline ?? '',
				description: pageRow.columnOne.description ?? '',
				image: pageRow.columnOne.image,
				imageFileUploadId: pageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: pageRow.columnOne.imageUrl ?? '',
				imageAltText: pageRow.columnOne.imageAltText ?? '',
			},
		};
		formValuesRef.current = nextValues;
		setFormValues(nextValues);
	}, [pageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (oneColumnRow: OneColumnRowModel, fv: OneColumnFormValues) => {
			setIsSaving(true);

			try {
				const response = await persistOneColumnRow(oneColumnRow, fv, institution.imageRepositoryEnabled);

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	const setLocalFormValues = useCallback((nextValues: OneColumnFormValues) => {
		formValuesRef.current = nextValues;
		setFormValues(nextValues);
	}, []);

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
			const nextValues = {
				...formValuesRef.current,
				[column]: {
					...formValuesRef.current[column],
					[currentTarget.name]: currentTarget.value,
				},
			};
			setLocalFormValues(nextValues);
			debouncedSubmission(pageRow, nextValues);
		},
		[debouncedSubmission, pageRow, setLocalFormValues]
	);

	const handleQuillChange = useCallback(
		(column: keyof typeof formValues, description: string) => {
			const nextValues = {
				...formValuesRef.current,
				[column]: { ...formValuesRef.current[column], description },
			};
			setLocalFormValues(nextValues);
			debouncedSubmission(pageRow, nextValues);
		},
		[debouncedSubmission, pageRow, setLocalFormValues]
	);

	const handleUploadComplete = useCallback(
		async (column: keyof typeof formValues, imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				const nextValue = {
					...formValuesRef.current,
					[column]: {
						...formValuesRef.current[column],
						imageFileUploadId,
					},
				};
				setLocalFormValues(nextValue);
				debouncedSubmission.cancel();
				const response = await persistOneColumnRow(pageRow, nextValue, institution.imageRepositoryEnabled);

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			debouncedSubmission,
			handleError,
			institution.imageRepositoryEnabled,
			pageRow,
			setIsSaving,
			setLocalFormValues,
			updatePageRow,
		]
	);

	const handleImageChange = useCallback(
		async (column: keyof typeof formValues, { nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			setLocalFormValues({
				...formValuesRef.current,
				[column]: {
					...formValuesRef.current[column],
					imageFileUploadId: nextId,
					imageUrl: nextSrc,
				},
			});

			if (!nextId && !nextSrc) {
				handleUploadComplete(column, '');
			}
		},
		[handleUploadComplete, setLocalFormValues]
	);

	const handleRepositoryImageChange = useCallback(
		async (column: keyof OneColumnFormValues, image?: ImageModel) => {
			const nextValues: OneColumnFormValues = {
				...formValuesRef.current,
				[column]: {
					...formValuesRef.current[column],
					image,
					imageFileUploadId: image?.fileUploadId ?? '',
					imageUrl: image?.url ?? '',
				},
			};
			setLocalFormValues(nextValues);
			debouncedSubmission.cancel();
			setIsSaving(true);

			try {
				const response = await persistOneColumnRow(pageRow, nextValues, true);
				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[debouncedSubmission, handleError, pageRow, setIsSaving, setLocalFormValues, updatePageRow]
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
						{institution.imageRepositoryEnabled ? (
							<AdminFormImageInputV2
								className="mb-4"
								buttonClassName="d-block w-100"
								value={formValues.columnOne.image}
								onChange={(image) => {
									void handleRepositoryImageChange('columnOne', image);
								}}
							/>
						) : (
							<AdminFormImageInput
								className="mb-4"
								imageSrc={formValues.columnOne.imageUrl}
								onSrcChange={(nextId, nextSrc) => {
									handleImageChange('columnOne', { nextId, nextSrc });
								}}
								onUploadComplete={(fileUploadId) => {
									void handleUploadComplete('columnOne', fileUploadId);
								}}
								presignedUploadGetter={(blob, name) => {
									return pagesService.createPresignedFileUpload({
										contentType: blob.type,
										filename: name,
									}).fetch;
								}}
								cropImage={false}
							/>
						)}
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
		</>
	);
};
