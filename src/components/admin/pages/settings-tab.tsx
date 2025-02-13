import React, { useCallback, useEffect, useState } from 'react';
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
		if (!page) {
			return;
		}

		setFormValues({
			pageName: page.name ?? '',
			friendlyUrl: page.urlName ?? '',
			pageTypeId: page.pageTypeId ?? '',
		});
	}, [page]);

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

	return (
		<>
			<InputHelper
				className="mb-4"
				type="text"
				label="Page name"
				name="pageName"
				value={formValues.pageName}
				onChange={handleInputChange}
				required
			/>
			<InputHelper
				className="mb-4"
				type="text"
				label="Friendly url"
				name="friendlyUrl"
				value={formValues.friendlyUrl}
				onChange={handleInputChange}
				required
			/>
			<InputHelper
				as="select"
				label="Page Type"
				name="pageTypeId"
				value={formValues.pageTypeId}
				onChange={handleInputChange}
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
		</>
	);
};
