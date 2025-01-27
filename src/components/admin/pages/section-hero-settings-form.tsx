import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';

export const HERO_SECTION_ID = 'HERO';

export const SectionHeroSettingsForm = () => {
	const handleError = useHandleError();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});

	useEffect(() => {
		setFormValues({
			headline: page?.headline ?? '',
			description: page?.description ?? '',
			imageFileUploadId: page?.imageFileUploadId ?? '',
			imageUrl: page?.imageUrl ?? '',
			imageAltText: page?.imageAltText ?? '',
		});
	}, [page?.description, page?.headline, page?.imageAltText, page?.imageFileUploadId, page?.imageUrl]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (requestBody: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageHero(page.pageId, {
					headline: requestBody.headline,
					description: requestBody.description,
					imageFileUploadId: requestBody.imageFileUploadId,
					imageAltText: requestBody.imageAltText,
				})
				.fetch();

			setPage(response.page);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

	useEffect(() => {
		debouncedSubmission(formValues);
	}, [debouncedSubmission, formValues]);

	return (
		<Form>
			<InputHelper
				className="mb-4"
				type="text"
				label="Headline"
				value={formValues.headline}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						headline: currentTarget.value,
					}));
				}}
			/>
			<InputHelper
				className="mb-4"
				as="textarea"
				label="Description"
				value={formValues.description}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						description: currentTarget.value,
					}));
				}}
			/>
			<AdminFormImageInput
				className="mb-4"
				imageSrc={formValues.imageUrl}
				onSrcChange={(nextId, nextSrc) => {
					setFormValues((previousValue) => ({
						...previousValue,
						imageFileUploadId: nextId,
						imageUrl: nextSrc,
					}));
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
				value={formValues.imageAltText}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						imageAltText: currentTarget.value,
					}));
				}}
			/>
		</Form>
	);
};
