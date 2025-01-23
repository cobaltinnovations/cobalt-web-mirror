import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { OneColumnImageRowModel } from '@/lib/models';

export const RowSettingsOneColumn = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow } = usePageBuilderContext();
	const oneColumnImageRow = useMemo(() => currentPageRow as OneColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});

	useEffect(() => {
		setFormValues({
			headline: oneColumnImageRow?.columnOne.headline ?? '',
			description: oneColumnImageRow?.columnOne.description ?? '',
			imageFileUploadId: oneColumnImageRow?.columnOne.imageFileUploadId ?? '',
			imageUrl: oneColumnImageRow?.columnOne.imageUrl ?? '',
			imageAltText: oneColumnImageRow?.columnOne.imageAltText ?? '',
		});
	}, [
		oneColumnImageRow?.columnOne.description,
		oneColumnImageRow?.columnOne.headline,
		oneColumnImageRow?.columnOne.imageAltText,
		oneColumnImageRow?.columnOne.imageFileUploadId,
		oneColumnImageRow?.columnOne.imageUrl,
	]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateOneColumnRow(currentPageRow.pageRowId, {
					columnOne: {
						headline: formValues.headline,
						description: formValues.description,
						imageFileUploadId: formValues.imageFileUploadId,
						imageAltText: formValues.imageAltText,
					},
				})
				.fetch();

			updatePageRow(response.pageRow);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Form onSubmit={handleFormSubmit}>
			<CollapseButton title="Item 1" initialShow>
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
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.description}
						onChange={(value) => {
							setFormValues((previousValue) => ({
								...previousValue,
								description: value,
							}));
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
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
				</Form.Group>
				<Button type="submit" variant="warning">
					Temp Submit Button (No live saving yet)
				</Button>
			</CollapseButton>
		</Form>
	);
};
