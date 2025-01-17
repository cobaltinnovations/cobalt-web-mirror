import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import InputHelper from '@/components/input-helper';

export const HERO_SECTION_ID = 'HERO';

export const SectionHeroSettingsForm = () => {
	const [formValues, setFormValues] = useState({
		headline: '',
		description: '',
		image: '',
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
