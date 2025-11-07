import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { MailingListRowModel } from '@/lib/models';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { pagesService } from '@/lib/services';

export const RowSettingsMailingList = () => {
	const handleError = useHandleError();
	const { currentPageRow, updatePageRow, setIsSaving } = usePageBuilderContext();
	const mailingListRow = useMemo(() => currentPageRow as MailingListRowModel | undefined, [currentPageRow]);
	const [formValues, setFormValues] = useState({ title: '', description: '' });

	useEffect(() => {
		if (!mailingListRow) {
			return;
		}

		setFormValues({
			title: mailingListRow.title,
			description: mailingListRow.description,
		});
	}, [mailingListRow]);

	const debouncedSubmission = useDebouncedAsyncFunction(async (pr: MailingListRowModel, fv: typeof formValues) => {
		setIsSaving(true);

		try {
			const { pageRow } = await pagesService
				.updateMailingListRow(pr.pageRowId, {
					pageRowId: pr.pageRowId,
					mailingListId: pr.mailingListId,
					title: fv.title,
					description: fv.description,
				})
				.fetch();

			updatePageRow(pageRow);
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

				if (mailingListRow) {
					debouncedSubmission(mailingListRow, newValue);
				}

				return newValue;
			});
		},
		[debouncedSubmission, mailingListRow]
	);

	return (
		<>
			<Form.Group className="mb-6">
				<Form.Label className="mb-2">Title</Form.Label>
				<InputHelper
					type="text"
					label="Title"
					name="title"
					value={formValues.title}
					onChange={handleInputChange}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label className="mb-2">Description</Form.Label>
				<InputHelper
					className="mb-4"
					as="textarea"
					label="Description"
					name="description"
					value={formValues.description}
					onChange={handleInputChange}
				/>
			</Form.Group>
		</>
	);
};
