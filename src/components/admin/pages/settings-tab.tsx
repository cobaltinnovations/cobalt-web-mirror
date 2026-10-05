import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import usePageBuilderContext from '@/hooks/use-page-builder-context';
import useHandleError from '@/hooks/use-handle-error';
import { usePageSettingsForm } from '@/hooks/use-page-settings-form';
import InputHelper from '@/components/input-helper';
import { EditUrlModal } from '@/components/admin/pages';
import SvgIcon from '@/components/svg-icon';
import { PageLocationSelect } from './page-location-select';

export const SettingsTab = () => {
	const handleError = useHandleError();
	const { page, setPage, setIsSaving } = usePageBuilderContext();
	const [showEditUrlModal, setShowEditUrlModal] = useState(false);
	const { formValues, changeValues, saveUrl } = usePageSettingsForm({
		page,
		onSaved: setPage,
		onSavingChange: setIsSaving,
		onError: handleError,
	});

	return (
		<>
			<PageLocationSelect
				className="mb-4"
				value={formValues.pageLocationId}
				description={page?.pageLocationDescription}
				onChange={(pageLocationId) => changeValues({ pageLocationId })}
			/>
			<EditUrlModal
				show={showEditUrlModal}
				friendlyUrl={formValues.friendlyUrl}
				onSaveUrl={saveUrl}
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
				onChange={({ currentTarget }) => changeValues({ pageName: currentTarget.value })}
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
					<SvgIcon kit="far" icon="pen" size={16} className="me-2" />
					Edit URL
				</Button>
			</div>
		</>
	);
};
