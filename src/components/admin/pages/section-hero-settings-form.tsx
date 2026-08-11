import React, { useCallback, useEffect, useRef, useState } from 'react';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import { AdminFormImageInputV2 } from '@/components/admin/admin-form-image-input-v2';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import { ImageModel, PageDetailModel } from '@/lib/models';
import { SIZE_SELECTIONS } from '@/components/session-crop-modal';
import useAccount from '@/hooks/use-account';
import { getPageBuilderImageAssociationRequest } from './page-builder-image';

export const HERO_SECTION_ID = 'HERO';

interface HeroFormValues {
	headline: string;
	description: string;
	image?: ImageModel;
	imageFileUploadId: string;
	imageUrl: string;
	imageAltText: string;
}

export const SectionHeroSettingsForm = () => {
	const handleError = useHandleError();
	const { institution } = useAccount();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const [formValues, setFormValues] = useState<HeroFormValues>({
		headline: '',
		description: '',
		image: undefined,
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});
	const formValuesRef = useRef(formValues);

	useEffect(() => {
		if (!page) {
			return;
		}

		const nextValues: HeroFormValues = {
			headline: page.headline ?? '',
			description: page.description ?? '',
			image: page.image,
			imageFileUploadId: page.imageFileUploadId ?? '',
			imageUrl: page.imageUrl ?? '',
			imageAltText: page.imageAltText ?? '',
		};
		formValuesRef.current = nextValues;
		setFormValues(nextValues);
	}, [page]);

	const persistHero = useCallback(
		async (p: PageDetailModel, fv: HeroFormValues) => {
			setIsSaving(true);

			try {
				const response = await pagesService
					.updatePageHero(p.pageId, {
						headline: fv.headline,
						description: fv.description,
						...getPageBuilderImageAssociationRequest(fv, institution.imageRepositoryEnabled),
						imageAltText: fv.imageAltText,
					})
					.fetch();

				setPage(response.page);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[handleError, institution.imageRepositoryEnabled, setIsSaving, setPage]
	);

	const debouncedSubmission = useDebouncedAsyncFunction(persistHero);

	const setLocalFormValues = useCallback((nextValues: HeroFormValues) => {
		formValuesRef.current = nextValues;
		setFormValues(nextValues);
	}, []);

	const handleInputChange = useCallback(
		({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			const nextValues = {
				...formValuesRef.current,
				[currentTarget.name]: currentTarget.value,
			} as HeroFormValues;
			setLocalFormValues(nextValues);

			if (page) {
				debouncedSubmission(page, nextValues);
			}
		},
		[debouncedSubmission, page, setLocalFormValues]
	);

	const handleUploadComplete = useCallback(
		async (fileUploadId?: string) => {
			if (!page) {
				handleError(new Error('page is undefined'));
				return;
			}

			const nextValues = { ...formValuesRef.current, imageFileUploadId: fileUploadId ?? '' };
			setLocalFormValues(nextValues);
			debouncedSubmission.cancel();
			await persistHero(page, nextValues);
		},
		[debouncedSubmission, handleError, page, persistHero, setLocalFormValues]
	);

	const handleImageChange = useCallback(
		async (nextId: string, nextSrc: string) => {
			setLocalFormValues({
				...formValuesRef.current,
				imageFileUploadId: nextId,
				imageUrl: nextSrc,
			});

			if (!nextId && !nextSrc) {
				handleUploadComplete('');
			}
		},
		[handleUploadComplete, setLocalFormValues]
	);

	const handleRepositoryImageChange = useCallback(
		async (image?: ImageModel) => {
			if (!page) {
				handleError(new Error('page is undefined'));
				return;
			}

			const nextValues: HeroFormValues = {
				...formValuesRef.current,
				image,
				imageFileUploadId: image?.fileUploadId ?? '',
				imageUrl: image?.url ?? '',
			};
			setLocalFormValues(nextValues);
			debouncedSubmission.cancel();
			await persistHero(page, nextValues);
		},
		[debouncedSubmission, handleError, page, persistHero, setLocalFormValues]
	);

	return (
		<>
			<InputHelper
				className="mb-4"
				type="text"
				label="Headline"
				required
				name="headline"
				value={formValues.headline}
				onChange={handleInputChange}
			/>
			<InputHelper
				className="mb-4"
				as="textarea"
				label="Description"
				required
				name="description"
				value={formValues.description}
				onChange={handleInputChange}
			/>
			{institution.imageRepositoryEnabled ? (
				<AdminFormImageInputV2
					className="mb-4"
					buttonClassName="d-block w-100"
					value={formValues.image}
					onChange={handleRepositoryImageChange}
				/>
			) : (
				<AdminFormImageInput
					className="mb-4"
					imageSrc={formValues.imageUrl}
					showSizeSelection={false}
					lockSizeSelection={SIZE_SELECTIONS.RECTANGLE}
					onSrcChange={handleImageChange}
					onUploadComplete={handleUploadComplete}
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
				value={formValues.imageAltText}
				onChange={handleInputChange}
			/>
		</>
	);
};
