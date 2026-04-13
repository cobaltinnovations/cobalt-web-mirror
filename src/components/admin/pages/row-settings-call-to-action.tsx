import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
	CallToActionBlockRowModel,
	CallToActionFullWidthRowModel,
	isCallToActionBlockRow,
	isCallToActionFullWidthRow,
	ROW_TYPE_ID,
} from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';

interface RowSettingsCallToActionProps {
	variant: 'block' | 'full-width';
}

type CallToActionRowModel = CallToActionBlockRowModel | CallToActionFullWidthRowModel;

export const RowSettingsCallToAction = ({ variant }: RowSettingsCallToActionProps) => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const callToActionRow = useMemo(() => {
		if (variant === 'block' && currentPageRow && isCallToActionBlockRow(currentPageRow)) {
			return currentPageRow;
		}

		if (variant === 'full-width' && currentPageRow && isCallToActionFullWidthRow(currentPageRow)) {
			return currentPageRow;
		}

		return undefined;
	}, [currentPageRow, variant]);
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		buttonText: '',
		buttonUrl: '',
		imageFileUploadId: '',
		imageUrl: '',
	});

	useEffect(() => {
		if (!callToActionRow) {
			return;
		}

		setFormValues({
			headline: callToActionRow.headline ?? '',
			description: callToActionRow.description ?? '',
			buttonText: callToActionRow.buttonText ?? '',
			buttonUrl: callToActionRow.buttonUrl ?? '',
			imageFileUploadId: callToActionRow.imageFileUploadId ?? '',
			imageUrl: callToActionRow.imageUrl ?? '',
		});
	}, [callToActionRow]);

	const persistValues = useCallback(
		async (row: CallToActionRowModel, values: typeof formValues) => {
			const response =
				row.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_BLOCK
					? await pagesService
							.updateCallToActionBlockRow(row.pageRowId, {
								headline: values.headline,
								description: values.description,
								buttonText: values.buttonText,
								buttonUrl: values.buttonUrl,
								imageFileUploadId: values.imageFileUploadId,
							})
							.fetch()
					: await pagesService
							.updateCallToActionFullWidthRow(row.pageRowId, {
								headline: values.headline,
								description: values.description,
								buttonText: values.buttonText,
								buttonUrl: values.buttonUrl,
							})
							.fetch();

			updatePageRow(response.pageRow);
		},
		[updatePageRow]
	);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (row: CallToActionRowModel, values: typeof formValues) => {
			setIsSaving(true);

			try {
				await persistValues(row, values);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		}
	);

	useEffect(() => {
		return () => {
			debouncedSubmission.cancel();
		};
	}, [debouncedSubmission]);

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				if (callToActionRow) {
					debouncedSubmission(callToActionRow, nextValue);
				}

				return nextValue;
			});
		},
		[callToActionRow, debouncedSubmission]
	);

	const handleDescriptionChange = useCallback(
		(description: string) => {
			setFormValues((previousValue) => {
				const nextValue = {
					...previousValue,
					description,
				};

				if (callToActionRow) {
					debouncedSubmission(callToActionRow, nextValue);
				}

				return nextValue;
			});
		},
		[callToActionRow, debouncedSubmission]
	);

	const handleUploadComplete = useCallback(
		async (imageFileUploadId: string) => {
			setIsSaving(true);

			try {
				if (!callToActionRow) {
					throw new Error('callToActionRow is undefined.');
				}

				const nextValue = {
					...formValues,
					imageFileUploadId,
				};

				await persistValues(callToActionRow, nextValue);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[callToActionRow, formValues, handleError, persistValues, setIsSaving]
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

	if (!callToActionRow) {
		return null;
	}

	return (
		<>
			<InputHelper
				className="mb-6"
				type="text"
				label="Headline"
				name="headline"
				required
				value={formValues.headline}
				onChange={handleInputChange}
			/>
			<Form.Group className="mb-6">
				<Form.Label className="mb-2">Description (optional)</Form.Label>
				<WysiwygBasic value={formValues.description} height={180} onChange={handleDescriptionChange} />
			</Form.Group>
			<div className="mb-6">
				<h5 className="mb-4">CTA Button</h5>
				<InputHelper
					className="mb-4"
					type="text"
					label="Button text"
					name="buttonText"
					required
					value={formValues.buttonText}
					onChange={handleInputChange}
				/>
				<InputHelper
					type="text"
					label="Button URL"
					name="buttonUrl"
					required
					value={formValues.buttonUrl}
					onChange={handleInputChange}
				/>
			</div>
			{variant === 'block' && (
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image (optional)</Form.Label>
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
				</Form.Group>
			)}
		</>
	);
};
