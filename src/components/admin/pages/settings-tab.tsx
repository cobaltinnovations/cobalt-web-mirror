import React, { useCallback, useEffect, useState } from 'react';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import InputHelper from '@/components/input-helper';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';

export const SettingsTab = () => {
	const handleError = useHandleError();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const [formValues, setFormValues] = useState({
		pageName: '',
		friendlyUrl: '',
	});

	useEffect(() => {
		if (!page) {
			return;
		}

		setFormValues({
			pageName: page.name ?? '',
			friendlyUrl: page.urlName ?? '',
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
				className="mb-1"
				type="text"
				label="Friendly url"
				name="friendlyUrl"
				value={formValues.friendlyUrl}
				onChange={handleInputChange}
				required
				disabled
			/>
			<div className="d-flex align-items-center">
				<InfoIcon className="me-1 text-n500 flex-shrink-0" width={12} height={12} />
				<p className="mb-0 small">
					{window.location.host}/pages/
					<span className="fw-bold">{formValues.friendlyUrl}</span>
				</p>
			</div>
		</>
	);
};
