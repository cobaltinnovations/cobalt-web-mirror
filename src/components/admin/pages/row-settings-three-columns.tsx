import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ImageModel, ThreeColumnRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { RowSettingsMetaForm } from '@/components/admin/pages';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { AdminFormImageInputV2 } from '@/components/admin/admin-form-image-input-v2';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import useAccount from '@/hooks/use-account';
import { getPageBuilderImageAssociationRequest } from './page-builder-image';

interface RowSettingsThreeColumnsProps {
	nameInputRef?: RefObject<HTMLInputElement>;
	pageRow: ThreeColumnRowModel;
}

type ThreeColumnFormColumn = {
	headline: string;
	description: string;
	image?: ImageModel;
	imageFileUploadId: string;
	imageUrl: string;
	imageAltText: string;
};

type ThreeColumnFormValues = {
	columnOne: ThreeColumnFormColumn;
	columnTwo: ThreeColumnFormColumn;
	columnThree: ThreeColumnFormColumn;
};

const persistThreeColumnRow = (
	pageRow: ThreeColumnRowModel,
	formValues: ThreeColumnFormValues,
	imageRepositoryEnabled: boolean
) => {
	const toRequest = (column: ThreeColumnFormColumn) => ({
		headline: column.headline,
		description: column.description,
		imageAltText: column.imageAltText,
		...getPageBuilderImageAssociationRequest(column, imageRepositoryEnabled),
	});

	return pagesService
		.updateThreeColumnRow(pageRow.pageRowId, {
			columnOne: toRequest(formValues.columnOne),
			columnTwo: toRequest(formValues.columnTwo),
			columnThree: toRequest(formValues.columnThree),
		})
		.fetch();
};

export const RowSettingsThreeColumns = ({ nameInputRef, pageRow }: RowSettingsThreeColumnsProps) => {
	const handleError = useHandleError();
	const { institution } = useAccount();
	const { updatePageRow, setIsSaving } = usePageBuilderContext();
	const [formValues, setFormValues] = useState<ThreeColumnFormValues>({
		columnOne: {
			headline: '',
			description: '',
			image: undefined,
			imageFileUploadId: '',
			imageUrl: '',
			imageAltText: '',
		},
		columnTwo: {
			headline: '',
			description: '',
			image: undefined,
			imageFileUploadId: '',
			imageUrl: '',
			imageAltText: '',
		},
		columnThree: {
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
		const nextValues: ThreeColumnFormValues = {
			columnOne: {
				headline: pageRow.columnOne.headline ?? '',
				description: pageRow.columnOne.description ?? '',
				image: pageRow.columnOne.image,
				imageFileUploadId: pageRow.columnOne.imageFileUploadId ?? '',
				imageUrl: pageRow.columnOne.imageUrl ?? '',
				imageAltText: pageRow.columnOne.imageAltText ?? '',
			},
			columnTwo: {
				headline: pageRow.columnTwo.headline ?? '',
				description: pageRow.columnTwo.description ?? '',
				image: pageRow.columnTwo.image,
				imageFileUploadId: pageRow.columnTwo.imageFileUploadId ?? '',
				imageUrl: pageRow.columnTwo.imageUrl ?? '',
				imageAltText: pageRow.columnTwo.imageAltText ?? '',
			},
			columnThree: {
				headline: pageRow.columnThree.headline ?? '',
				description: pageRow.columnThree.description ?? '',
				image: pageRow.columnThree.image,
				imageFileUploadId: pageRow.columnThree.imageFileUploadId ?? '',
				imageUrl: pageRow.columnThree.imageUrl ?? '',
				imageAltText: pageRow.columnThree.imageAltText ?? '',
			},
		};
		formValuesRef.current = nextValues;
		setFormValues(nextValues);
	}, [pageRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (threeColumnRow: ThreeColumnRowModel, fv: ThreeColumnFormValues) => {
			setIsSaving(true);

			try {
				const response = await persistThreeColumnRow(threeColumnRow, fv, institution.imageRepositoryEnabled);

				updatePageRow(response.pageRow);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	const setLocalFormValues = useCallback((nextValues: ThreeColumnFormValues) => {
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
				const nextValues = {
					...formValuesRef.current,
					[column]: { ...formValuesRef.current[column], imageFileUploadId },
				};
				setLocalFormValues(nextValues);
				debouncedSubmission.cancel();
				const response = await persistThreeColumnRow(pageRow, nextValues, institution.imageRepositoryEnabled);

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
		async (column: keyof ThreeColumnFormValues, image?: ImageModel) => {
			const nextValues: ThreeColumnFormValues = {
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
				const response = await persistThreeColumnRow(pageRow, nextValues, true);
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
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					{institution.imageRepositoryEnabled ? (
						<AdminFormImageInputV2
							className="mb-4"
							buttonClassName="d-block w-100"
							value={formValues.columnTwo.image}
							onChange={(image) => {
								void handleRepositoryImageChange('columnTwo', image);
							}}
						/>
					) : (
						<AdminFormImageInput
							className="mb-4"
							imageSrc={formValues.columnTwo.imageUrl}
							onSrcChange={(nextId, nextSrc) => {
								handleImageChange('columnTwo', { nextId, nextSrc });
							}}
							onUploadComplete={(fileUploadId) => {
								void handleUploadComplete('columnTwo', fileUploadId);
							}}
							presignedUploadGetter={(blob, name) => {
								return pagesService.createPresignedFileUpload({
									contentType: blob.type,
									filename: name,
								}).fetch;
							}}
						/>
					)}
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
						toolbarPreset="page-builder"
						height={228}
						value={formValues.columnThree.description}
						onChange={(value) => {
							handleQuillChange('columnThree', value);
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					{institution.imageRepositoryEnabled ? (
						<AdminFormImageInputV2
							className="mb-4"
							buttonClassName="d-block w-100"
							value={formValues.columnThree.image}
							onChange={(image) => {
								void handleRepositoryImageChange('columnThree', image);
							}}
						/>
					) : (
						<AdminFormImageInput
							className="mb-4"
							imageSrc={formValues.columnThree.imageUrl}
							onSrcChange={(nextId, nextSrc) => {
								handleImageChange('columnThree', { nextId, nextSrc });
							}}
							onUploadComplete={(fileUploadId) => {
								void handleUploadComplete('columnThree', fileUploadId);
							}}
							presignedUploadGetter={(blob, name) => {
								return pagesService.createPresignedFileUpload({
									contentType: blob.type,
									filename: name,
								}).fetch;
							}}
						/>
					)}
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
