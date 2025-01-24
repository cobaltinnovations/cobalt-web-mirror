import React, { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { PAGE_TYPE_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

const pageTypes = [
	{
		pageTypeId: PAGE_TYPE_ID.TOPIC_CENTER,
		title: 'Topic Center',
	},
	{
		pageTypeId: PAGE_TYPE_ID.COMMUNITY,
		title: 'Community',
	},
];

export const SettingsTab = () => {
	const handleError = useHandleError();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const pageNameInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({
		pageName: '',
		friendlyUrl: '',
		pageTypeId: PAGE_TYPE_ID.TOPIC_CENTER,
	});

	useEffect(() => {
		pageNameInputRef.current?.focus();

		setFormValues({
			pageName: page?.name ?? '',
			friendlyUrl: page?.urlName ?? '',
			pageTypeId: page?.pageTypeId ?? PAGE_TYPE_ID.TOPIC_CENTER,
		});
	}, [page?.name, page?.pageTypeId, page?.urlName]);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageSettings(page.pageId, {
					name: formValues.pageName,
					urlName: formValues.friendlyUrl,
					pageTypeId: formValues.pageTypeId,
				})
				.fetch();

			setPage(response.page);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Form onSubmit={handleFormSubmit}>
			<InputHelper
				ref={pageNameInputRef}
				className="mb-4"
				type="text"
				label="Page name"
				value={formValues.pageName}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						pageName: currentTarget.value,
					}));
				}}
				required
			/>
			<InputHelper
				className="mb-4"
				type="text"
				label="Friendly url"
				value={formValues.friendlyUrl}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						friendlyUrl: currentTarget.value,
					}));
				}}
				required
			/>
			<InputHelper
				as="select"
				label="Page Type"
				value={formValues.pageTypeId}
				onChange={({ currentTarget }) => {
					setFormValues((previousValue) => ({
						...previousValue,
						pageTypeId: currentTarget.value as PAGE_TYPE_ID,
					}));
				}}
				helperText="The type determines where the content lives on Cobalt"
				required
			>
				<option value="" disabled>
					Select page type...
				</option>
				{pageTypes.map((pt) => (
					<option key={pt.pageTypeId} value={pt.pageTypeId}>
						{pt.title}
					</option>
				))}
			</InputHelper>
			<Button type="submit" variant="warning" className="mt-4">
				Temp Submit Button (No live saving yet)
			</Button>
		</Form>
	);
};
