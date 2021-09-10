import React, { FC, useRef, useState } from 'react';
import { Button, Modal, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { uploadOrder } from '@/hooks/pic-hooks';

const PatientImportButton: FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
	const { t } = useTranslation();
	const [showModal, setShowModal] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File>();
	const [numRecords, setNumRecords] = useState(0);
	const [uploadProgress, setUploadProgress] = useState(0);
	const uploadRequestAbortRef = useRef<() => void>();

	const title =
		numRecords > 0 ? t('picPatientImport.title.complete', 'import complete') : t('picPatientImport.title.uploading', 'importing patients from file');

	const uploadStatus = uploadProgress === 100 ? t('picPatientImport.status.uploaded', 'Uploaded') : t('picPatientImport.status.uploading', 'Uploading...');

	const resetState = () => {
		setSelectedFile(undefined);
		setNumRecords(0);
		setUploadProgress(0);
	};

	const cancelUpload = () => {
		typeof uploadRequestAbortRef.current === 'function' && uploadRequestAbortRef.current();
		setShowModal(false);
	};

	return (
		<>
			<Modal
				show={showModal}
				centered
				onHide={() => {
					if (uploadProgress < 100) {
						cancelUpload();
					} else {
						setShowModal(false);
					}

					resetState();
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<h4>{title}</h4>
						{numRecords > 0 && <p>{t('picPatientImport.importedRecords', '{{numRecords}} new patients added', { numRecords })}</p>}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<div className="border p-2">
						<p className="text-gray font-weight-semi-bold mb-0">{uploadStatus}</p>
						{selectedFile && (
							<p className="mt-1">
								{selectedFile.name} <span className="ml-4 text-muted">{(selectedFile.size / (1024 * 1024)).toFixed(2)} mb</span>
							</p>
						)}
						<ProgressBar className="my-2" variant={uploadProgress === 100 ? 'success' : 'primary'} now={uploadProgress} />
						{uploadProgress > -1 && (
							<p className="mb-0">{t('picPatientImport.percentComplete', '{{uploadProgress}}% complete', { uploadProgress })}</p>
						)}
					</div>
				</Modal.Body>

				{uploadProgress < 100 && (
					<Modal.Footer className="justify-content-end">
						<Button size="sm" variant="outline-primary" onClick={cancelUpload}>
							{t('picPatientImport.actions.cancel', 'cancel import')}
						</Button>
					</Modal.Footer>
				)}
			</Modal>

			<div>
				<input
					type="file"
					id="patientImport"
					name="patientImport"
					className="d-none"
					accept=".csv"
					onChange={(e) => {
						if (e.target.files?.length === 1) {
							const file = e.target.files[0];
							const formData = new FormData();
							formData.append('patients', file);

							setUploadProgress(0);
							setSelectedFile(file);
							setShowModal(true);

							const { uploadPromise, abort } = uploadOrder({
								formData,
								onUploadProgress: (progressEvent) => {
									const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
									setUploadProgress(percentCompleted);
								},
							});

							uploadPromise.then((response) => {
								setNumRecords(response.data.recordsParsed);
								onUploadSuccess();
							});

							uploadRequestAbortRef.current = abort;
						}
					}}
				/>
				<label htmlFor="patientImport" className="cursor-pointer cobalt-button cobalt-button-primary cobalt-button-sm">
					{t('picPatientImport.actions.import', 'import patients')}
				</label>
			</div>
		</>
	);
};

export default PatientImportButton;
