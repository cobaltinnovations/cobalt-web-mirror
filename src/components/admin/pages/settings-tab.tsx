import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { pagesService } from '@/lib/services';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import useDebouncedAsyncFunction from '@/hooks/use-debounced-async-function';
import InputHelper from '@/components/input-helper';
import { EditUrlModal } from '@/components/admin/pages';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';

export const SettingsTab = () => {
	const handleError = useHandleError();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const [showEditUrlModal, setShowEditUrlModal] = useState(false);
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
			<EditUrlModal
				show={showEditUrlModal}
				onHide={() => {
					setShowEditUrlModal(false);
				}}
				onSave={() => {
					setShowEditUrlModal(false);
				}}
			/>
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
				onChange={() => {
					return;
				}}
				required
				disabled
			/>
			<div className="d-flex justify-content-end">
				<Button
					variant="light"
					className="d-flex align-items-center"
					onClick={() => {
						setShowEditUrlModal(true);
					}}
					disabled={page?.editingLivePage}
				>
					<EditIcon className="me-2" width={20} height={20} />
					Edit URL
				</Button>
			</div>
		</>
	);
};
