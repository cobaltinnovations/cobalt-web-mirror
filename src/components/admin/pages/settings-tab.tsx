import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { PAGE_TYPE_ID } from '@/lib/models';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';

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
	const [formValues, setFormValues] = useState({
		pageName: '',
		friendlyUrl: '',
		pageTypeId: PAGE_TYPE_ID.TOPIC_CENTER,
	});

	useEffect(() => {
		setFormValues({
			pageName: page?.name ?? '',
			friendlyUrl: page?.urlName ?? '',
			pageTypeId: page?.pageTypeId ?? PAGE_TYPE_ID.TOPIC_CENTER,
		});
	}, [page?.name, page?.pageTypeId, page?.urlName]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (fv: typeof formValues) => {
		setIsSaving(true);

		try {
			if (!page) {
				throw new Error('page is undefined');
			}

			const response = await pagesService
				.updatePageSettings(page.pageId, {
					name: fv.pageName,
					urlName: fv.friendlyUrl,
					pageTypeId: fv.pageTypeId,
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
		</Form>
	);
};
