import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useEffect, useState } from 'react';
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
		if (!page) {
			return;
		}

		setFormValues({
			headline: page.headline ?? '',
			description: page.description ?? '',
			imageFileUploadId: page.imageFileUploadId ?? '',
			imageUrl: page.imageUrl ?? '',
			imageAltText: page.imageAltText ?? '',
		});
	}, [page]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageHero(page.pageId, {
					headline: fv.headline,
					description: fv.description,
					imageFileUploadId: fv.imageFileUploadId,
					imageAltText: fv.imageAltText,
				})
				.fetch();

			setPage(response.page);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	});

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			setFormValues((previousValue) => {
				const newValue = {
					...previousValue,
					[currentTarget.name]: currentTarget.value,
				};

				debouncedSubmission(newValue);
				return newValue;
			});
		},
		[debouncedSubmission]
	);

	const handleImageChange = useCallback(
		async (nextId: string, nextSrc: string) => {
			setFormValues((previousValue) => ({
				...previousValue,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			}));

			setIsSaving(true);

			try {
				if (!page) {
					throw new Error('page is undefined');
				}

				const response = await pagesService
					.updatePageHero(page.pageId, {
						headline: page.headline,
						description: page.description,
						imageFileUploadId: nextId,
						imageAltText: page.imageAltText,
					})
					.fetch();

				setPage(response.page);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, page, setIsSaving, setPage]
	);

	return (
		<Form>
			<InputHelper
				className="mb-4"
				type="text"
				label="Headline"
				name="headline"
				value={formValues.headline}
				onChange={handleInputChange}
			/>
			<InputHelper
				className="mb-4"
				as="textarea"
				label="Description"
				name="description"
				value={formValues.description}
				onChange={handleInputChange}
			/>
			<AdminFormImageInput
				className="mb-4"
				imageSrc={formValues.imageUrl}
				onSrcChange={handleImageChange}
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
				value={formValues.imageAltText}
				onChange={handleInputChange}
			/>
		</Form>
	);
};
