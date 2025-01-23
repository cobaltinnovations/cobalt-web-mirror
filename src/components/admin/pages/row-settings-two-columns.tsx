import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TwoColumnImageRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';

export const RowSettingsTwoColumns = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow } = usePageBuilderContext();
	const twoColumnImageRow = useMemo(() => currentPageRow as TwoColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		columnOneHeadline: '',
		columnOneDescription: '',
		columnOneImageFileUploadId: '',
		columnOneImageUrl: '',
		columnOneImageAltText: '',
		columnTwoHeadline: '',
		columnTwoDescription: '',
		columnTwoImageFileUploadId: '',
		columnTwoImageUrl: '',
		columnTwoImageAltText: '',
	});

	useEffect(() => {
		setFormValues({
			columnOneHeadline: twoColumnImageRow?.columnOne.headline ?? '',
			columnOneDescription: twoColumnImageRow?.columnOne.description ?? '',
			columnOneImageFileUploadId: twoColumnImageRow?.columnOne.imageFileUploadId ?? '',
			columnOneImageUrl: twoColumnImageRow?.columnOne.imageUrl ?? '',
			columnOneImageAltText: twoColumnImageRow?.columnOne.imageAltText ?? '',
			columnTwoHeadline: twoColumnImageRow?.columnTwo.headline ?? '',
			columnTwoDescription: twoColumnImageRow?.columnTwo.description ?? '',
			columnTwoImageFileUploadId: twoColumnImageRow?.columnTwo.imageFileUploadId ?? '',
			columnTwoImageUrl: twoColumnImageRow?.columnTwo.imageUrl ?? '',
			columnTwoImageAltText: twoColumnImageRow?.columnTwo.imageAltText ?? '',
		});
	}, [
		twoColumnImageRow?.columnOne.description,
		twoColumnImageRow?.columnOne.headline,
		twoColumnImageRow?.columnOne.imageAltText,
		twoColumnImageRow?.columnOne.imageFileUploadId,
		twoColumnImageRow?.columnOne.imageUrl,
		twoColumnImageRow?.columnTwo.description,
		twoColumnImageRow?.columnTwo.headline,
		twoColumnImageRow?.columnTwo.imageAltText,
		twoColumnImageRow?.columnTwo.imageFileUploadId,
		twoColumnImageRow?.columnTwo.imageUrl,
	]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateTwoColumnRow(currentPageRow.pageRowId, {
					columnOne: {
						headline: formValues.columnOneHeadline,
						description: formValues.columnOneDescription,
						imageFileUploadId: formValues.columnOneImageFileUploadId,
						imageAltText: formValues.columnOneImageAltText,
					},
					columnTwo: {
						headline: formValues.columnTwoHeadline,
						description: formValues.columnTwoDescription,
						imageFileUploadId: formValues.columnTwoImageFileUploadId,
						imageAltText: formValues.columnTwoImageAltText,
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
					value={formValues.columnOneHeadline}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							columnOneHeadline: currentTarget.value,
						}));
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnOneDescription}
						onChange={(value) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOneDescription: value,
							}));
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnOneImageUrl}
						onSrcChange={(nextId, nextSrc) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOneImageFileUploadId: nextId,
								columnOneImageUrl: nextSrc,
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
						value={formValues.columnOneImageAltText}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOneImageAltText: currentTarget.value,
							}));
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
					value={formValues.columnTwoHeadline}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							columnTwoHeadline: currentTarget.value,
						}));
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnTwoDescription}
						onChange={(value) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwoDescription: value,
							}));
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnTwoImageUrl}
						onSrcChange={(nextId, nextSrc) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwoImageFileUploadId: nextId,
								columnTwoImageUrl: nextSrc,
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
						value={formValues.columnTwoImageAltText}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwoImageAltText: currentTarget.value,
							}));
						}}
					/>
				</Form.Group>
			</CollapseButton>
			<Button type="submit" variant="warning">
				Temp Submit Button (No live saving yet)
			</Button>
		</Form>
	);
};
