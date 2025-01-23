import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';

export const HERO_SECTION_ID = 'HERO';

export const SectionHeroSettingsForm = () => {
	const handleError = useHandleError();
	const { page, setPage } = usePageBuilderContext();
	const headlineInputRef = useRef<HTMLInputElement>(null);
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
			imageUrl: '',
			imageAltText: page?.imageAltText ?? '',
		});

		headlineInputRef.current?.focus();
	}, [page?.description, page?.headline, page?.imageAltText, page?.imageFileUploadId]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!page) {
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageHero(page.pageId, {
					headline: formValues.headline,
					description: formValues.description,
					imageFileUploadId: formValues.imageFileUploadId,
					imageAltText: formValues.imageAltText,
				})
				.fetch();

			setPage(response.page);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Form onSubmit={handleFormSubmit}>
			<InputHelper
				ref={headlineInputRef}
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
				className="mb-4"
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
			<Button type="submit" variant="warning">
				Temp Submit Button (No live saving yet)
			</Button>
		</Form>
	);
};
