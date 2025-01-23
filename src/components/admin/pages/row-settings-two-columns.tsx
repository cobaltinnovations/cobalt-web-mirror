import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TwoColumnImageRowModel } from '@/lib/models';
import { pagesService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import { CollapseButton } from '@/components/admin/pages/collapse-button';
import { AdminFormImageInput } from '@/components/admin/admin-form-image-input';
import InputHelper from '@/components/input-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';

export const RowSettingsTwoColumns = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow } = usePageBuilderContext();
	const twoColumnImageRow = useMemo(() => currentPageRow as TwoColumnImageRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({
		columnOne: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
		columnTwo: { headline: '', description: '', imageFileUploadId: '', imageUrl: '', imageAltText: '' },
	});

	useEffect(() => {
		setFormValues({
			columnOne: {
				headline: twoColumnImageRow?.columnOne.headline ?? '',
				description: twoColumnImageRow?.columnOne.description ?? '',
				imageFileUploadId: twoColumnImageRow?.columnOne.imageFileUploadId ?? '',
				imageUrl: twoColumnImageRow?.columnOne.imageUrl ?? '',
				imageAltText: twoColumnImageRow?.columnOne.imageAltText ?? '',
			},
			columnTwo: {
				headline: twoColumnImageRow?.columnTwo.headline ?? '',
				description: twoColumnImageRow?.columnTwo.description ?? '',
				imageFileUploadId: twoColumnImageRow?.columnTwo.imageFileUploadId ?? '',
				imageUrl: twoColumnImageRow?.columnTwo.imageUrl ?? '',
				imageAltText: twoColumnImageRow?.columnTwo.imageAltText ?? '',
			},
		});
	}, [twoColumnImageRow]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!currentPageRow) {
				throw new Error('currentPageRow is undefined.');
			}

			const response = await pagesService
				.updateTwoColumnRow(currentPageRow.pageRowId, {
					columnOne: formValues.columnOne,
					columnTwo: formValues.columnTwo,
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
					value={formValues.columnOne.headline}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							columnOne: {
								...previousValue.columnOne,
								headline: currentTarget.value,
							},
						}));
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnOne.description}
						onChange={(value) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOne: {
									...previousValue.columnOne,
									description: value,
								},
							}));
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnOne.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOne: {
									...previousValue.columnOne,
									imageFileUploadId: nextId,
									imageUrl: nextSrc,
								},
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
						value={formValues.columnOne.imageAltText}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnOne: {
									...previousValue.columnOne,
									imageAltText: currentTarget.value,
								},
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
					value={formValues.columnTwo.headline}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => ({
							...previousValue,
							columnTwo: {
								...previousValue.columnTwo,
								headline: currentTarget.value,
							},
						}));
					}}
				/>
				<Form.Group className="mb-4">
					<Form.Label className="mb-2">Description</Form.Label>
					<WysiwygBasic
						height={228}
						value={formValues.columnTwo.description}
						onChange={(value) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwo: {
									...previousValue.columnTwo,
									description: value,
								},
							}));
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label className="mb-2">Image</Form.Label>
					<AdminFormImageInput
						className="mb-4"
						imageSrc={formValues.columnTwo.imageUrl}
						onSrcChange={(nextId, nextSrc) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwo: {
									...previousValue.columnTwo,
									imageFileUploadId: nextId,
									imageUrl: nextSrc,
								},
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
						value={formValues.columnTwo.imageAltText}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								columnTwo: {
									...previousValue.columnTwo,
									imageAltText: currentTarget.value,
								},
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
