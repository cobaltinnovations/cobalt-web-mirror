import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import InputHelper from '@/components/input-helper';
import { AdminFormImageInput } from '../admin-form-image-input';
import { groupSessionsService } from '@/lib/services';

export const HERO_SECTION_ID = 'HERO';

export const SectionHeroSettingsForm = () => {
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		imageFileUploadId: '',
		imageUrl: '',
		imageAltText: '',
	});

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
					return groupSessionsService.getPresignedUploadUrl({
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
		</Form>
	);
};
