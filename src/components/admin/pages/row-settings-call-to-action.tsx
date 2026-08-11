import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, type FormControlProps } from 'react-bootstrap';
import {
	CallToActionBlockRowModel,
	CallToActionFullWidthRowModel,
	ImageModel,
	isCallToActionBlockRow,
	isCallToActionFullWidthRow,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
} from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { AdminFormImageInputV2 } from '@/components/admin/admin-form-image-input-v2';
import useAccount from '@/hooks/use-account';
import { getPageBuilderImageAssociationRequest } from './page-builder-image';

interface RowSettingsCallToActionProps {
	variant: 'block' | 'full-width';
}

type CallToActionRowModel = CallToActionBlockRowModel | CallToActionFullWidthRowModel;
type FormControlChangeEvent = Parameters<NonNullable<FormControlProps['onChange']>>[0];

interface CallToActionFormValues {
	headline: string;
	description: string;
	buttonText: string;
	buttonUrl: string;
	image?: ImageModel;
	imageFileUploadId: string;
	imageUrl: string;
	paddingTopId: ROW_PADDING_ID;
	paddingBottomId: ROW_PADDING_ID;
}

export const RowSettingsCallToAction = ({ variant }: RowSettingsCallToActionProps) => {
	const handleError = useHandleError();
	const { institution } = useAccount();
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
	const [formValues, setFormValues] = useState<CallToActionFormValues>({
		headline: '',
		description: '',
		buttonText: '',
		buttonUrl: '',
		image: undefined,
		imageFileUploadId: '',
		imageUrl: '',
		paddingTopId: ROW_PADDING_ID.MEDIUM,
		paddingBottomId: ROW_PADDING_ID.MEDIUM,
	});
	const formValuesRef = useRef(formValues);
	const formRowIdRef = useRef<string>();
	const hasUnsavedChangesRef = useRef(false);
	const persistenceQueueRef = useRef<Promise<void>>(Promise.resolve());
	const pendingPersistenceCountRef = useRef(0);

	const persistValues = useCallback(
		async (row: CallToActionRowModel, values: CallToActionFormValues) => {
			if (row.rowTypeId === ROW_TYPE_ID.CALL_TO_ACTION_BLOCK) {
				await pagesService
					.updateCallToActionBlockRow(row.pageRowId, {
						headline: values.headline,
						description: values.description,
						buttonText: values.buttonText,
						buttonUrl: values.buttonUrl,
						...getPageBuilderImageAssociationRequest(values, institution.imageRepositoryEnabled),
					})
					.fetch();
			} else {
				await pagesService
					.updateCallToActionFullWidthRow(row.pageRowId, {
						headline: values.headline,
						description: values.description,
						buttonText: values.buttonText,
						buttonUrl: values.buttonUrl,
					})
					.fetch();
			}

			const { pageRow: updatedPageRow } = await pagesService
				.updatePageRow(row.pageRowId, {
					name: row.name,
					backgroundColorId: row.backgroundColorId,
					paddingTopId: values.paddingTopId,
					paddingBottomId: values.paddingBottomId,
				})
				.fetch();

			updatePageRow(updatedPageRow);
		},
		[institution.imageRepositoryEnabled, updatePageRow]
	);

	const runPersistence = useCallback(
		async (persistence: () => Promise<void>) => {
			pendingPersistenceCountRef.current += 1;
			setIsSaving(true);

			const queuedPersistence = persistenceQueueRef.current.then(persistence);
			persistenceQueueRef.current = queuedPersistence.catch(() => undefined);

			try {
				await queuedPersistence;
			} finally {
				pendingPersistenceCountRef.current -= 1;

				if (pendingPersistenceCountRef.current === 0) {
					setIsSaving(false);
				}
			}
		},
		[setIsSaving]
	);

	const persistFormValues = useCallback(
		async (row: CallToActionRowModel, values: CallToActionFormValues) => {
			try {
				await runPersistence(() => persistValues(row, values));

				if (formValuesRef.current === values) {
					hasUnsavedChangesRef.current = false;
				}
			} catch (error) {
				handleError(error);
			}
		},
		[handleError, persistValues, runPersistence]
	);

	const debouncedSubmission = useDebouncedAsyncFunction(
		async (row: CallToActionRowModel, values: CallToActionFormValues) => {
			await persistFormValues(row, values);
		}
	);

	useEffect(() => {
		const previousRowId = formRowIdRef.current;
		const nextRowId = callToActionRow?.pageRowId;

		if (previousRowId && previousRowId !== nextRowId) {
			void debouncedSubmission.flush();
		}

		if (!callToActionRow) {
			formRowIdRef.current = undefined;
			hasUnsavedChangesRef.current = false;
			return;
		}

		if (previousRowId === nextRowId && hasUnsavedChangesRef.current) {
			return;
		}

		const nextValues: CallToActionFormValues = {
			headline: callToActionRow.headline ?? '',
			description: callToActionRow.description ?? '',
			buttonText: callToActionRow.buttonText ?? '',
			buttonUrl: callToActionRow.buttonUrl ?? '',
			image: callToActionRow.image,
			imageFileUploadId: callToActionRow.imageFileUploadId ?? '',
			imageUrl: callToActionRow.imageUrl ?? '',
			paddingTopId: callToActionRow.paddingTopId ?? ROW_PADDING_ID.MEDIUM,
			paddingBottomId: callToActionRow.paddingBottomId ?? ROW_PADDING_ID.MEDIUM,
		};

		formRowIdRef.current = nextRowId;
		formValuesRef.current = nextValues;
		hasUnsavedChangesRef.current = false;
		setFormValues(nextValues);
	}, [callToActionRow, debouncedSubmission]);

	useEffect(() => {
		return () => {
			void debouncedSubmission.flush();
		};
	}, [debouncedSubmission]);

	const setLocalFormValues = useCallback((nextValues: CallToActionFormValues) => {
		formValuesRef.current = nextValues;
		hasUnsavedChangesRef.current = true;
		setFormValues(nextValues);
	}, []);

	const handleInputChange = useCallback(
		({ currentTarget }: FormControlChangeEvent) => {
			const nextValue = {
				...formValuesRef.current,
				[currentTarget.name]: currentTarget.value,
			} as CallToActionFormValues;

			setLocalFormValues(nextValue);

			if (callToActionRow) {
				debouncedSubmission(callToActionRow, nextValue);
			}
		},
		[callToActionRow, debouncedSubmission, setLocalFormValues]
	);

	const handleDescriptionChange = useCallback(
		(description: string) => {
			const nextValue = {
				...formValuesRef.current,
				description,
			};

			setLocalFormValues(nextValue);

			if (callToActionRow) {
				debouncedSubmission(callToActionRow, nextValue);
			}
		},
		[callToActionRow, debouncedSubmission, setLocalFormValues]
	);

	const handleUploadComplete = useCallback(
		async (imageFileUploadId: string) => {
			if (!callToActionRow || formRowIdRef.current !== callToActionRow.pageRowId) {
				handleError(new Error('callToActionRow is undefined or no longer active.'));
				return;
			}

			const nextValue = {
				...formValuesRef.current,
				imageFileUploadId,
			};

			setLocalFormValues(nextValue);
			debouncedSubmission.cancel();
			await persistFormValues(callToActionRow, nextValue);
		},
		[callToActionRow, debouncedSubmission, handleError, persistFormValues, setLocalFormValues]
	);

	const handleImageChange = useCallback(
		({ nextId, nextSrc }: { nextId: string; nextSrc: string }) => {
			const nextValue = {
				...formValuesRef.current,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			};

			setLocalFormValues(nextValue);

			if (!nextId && !nextSrc) {
				void handleUploadComplete('');
			}
		},
		[handleUploadComplete, setLocalFormValues]
	);

	const handleRepositoryImageChange = useCallback(
		async (image?: ImageModel) => {
			if (!callToActionRow || formRowIdRef.current !== callToActionRow.pageRowId) {
				handleError(new Error('callToActionRow is undefined or no longer active.'));
				return;
			}

			const nextValue: CallToActionFormValues = {
				...formValuesRef.current,
				image,
				imageFileUploadId: image?.fileUploadId ?? '',
				imageUrl: image?.url ?? '',
			};

			setLocalFormValues(nextValue);
			debouncedSubmission.cancel();
			await persistFormValues(callToActionRow, nextValue);
		},
		[callToActionRow, debouncedSubmission, handleError, persistFormValues, setLocalFormValues]
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
			<div className="d-flex gap-4 mb-6">
				<div className="flex-grow-1">
					<InputHelper
						className="mb-0"
						as="select"
						label="Padding top"
						name="paddingTopId"
						value={formValues.paddingTopId}
						onChange={handleInputChange}
					>
						<option value={ROW_PADDING_ID.NONE}>None</option>
						<option value={ROW_PADDING_ID.SMALL}>Small</option>
						<option value={ROW_PADDING_ID.MEDIUM}>Medium</option>
						<option value={ROW_PADDING_ID.LARGE}>Large</option>
					</InputHelper>
				</div>
				<div className="flex-grow-1">
					<InputHelper
						className="mb-0"
						as="select"
						label="Padding bottom"
						name="paddingBottomId"
						value={formValues.paddingBottomId}
						onChange={handleInputChange}
					>
						<option value={ROW_PADDING_ID.NONE}>None</option>
						<option value={ROW_PADDING_ID.SMALL}>Small</option>
						<option value={ROW_PADDING_ID.MEDIUM}>Medium</option>
						<option value={ROW_PADDING_ID.LARGE}>Large</option>
					</InputHelper>
				</div>
			</div>
			<Form.Group className="mb-6">
				<Form.Label className="mb-2">Description (optional)</Form.Label>
				<WysiwygBasic
					toolbarPreset="page-builder"
					value={formValues.description}
					height={180}
					onChange={handleDescriptionChange}
				/>
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
					helperText="Use an HTTP(S) URL or a site-relative path beginning with /."
					value={formValues.buttonUrl}
					onChange={handleInputChange}
				/>
			</div>
			{variant === 'block' && (
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image (optional)</Form.Label>
					{institution.imageRepositoryEnabled ? (
						<AdminFormImageInputV2
							className="mb-4"
							buttonClassName="d-block w-100"
							value={formValues.image}
							onChange={(image) => {
								void handleRepositoryImageChange(image);
							}}
						/>
					) : (
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
					)}
				</Form.Group>
			)}
		</>
	);
};
