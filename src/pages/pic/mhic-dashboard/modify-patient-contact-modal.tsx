import React, { FC, useState } from 'react';
import { Button, Modal, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { FormattedPatientObject, UpdatedDemographics } from '@/pages/pic/utils';
import { putUpdatePatientsDemographics } from '@/hooks/pic-hooks';

interface Props {
	show: boolean;
	modalSaveHandler: () => void;
	modalCloseHandler: () => void;
	patient: FormattedPatientObject;
}

const ModifyPatientContactModal: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { show, modalCloseHandler, modalSaveHandler, patient } = props;


	const [updatePhone, setUpdatePhone] = useState(patient.phone);
	const [updateEmail, setUpdateEmail] = useState(patient.email);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleUpdatePhone = (phone: string) => {
		const isValid = phone.match(
			/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm
		);

		if (isValid) {
			setUpdatePhone(phone);
			setError(false);
		}

		if (!isValid) {
			setUpdatePhone(phone);
			setError(true);
		}


	}

	const handleUpdateEmail = (email: string) => {
		const isValid = email.match(
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);

		if (isValid) {
			setUpdateEmail(email);
			setError(false);
		}

		if (!isValid) {
			setUpdateEmail(email);
			setError(true);
		}
	}


	const handleModalClose = () => {
		setUpdatePhone(patient.phone);
		setUpdateEmail(patient.email);

		modalCloseHandler();
	}

	const handleModifyContactSave = () => {
		const contact = {
			phone: updatePhone,
			email: updateEmail
		};

		mutate(contact);
	};

	const putContact = async (demographics: UpdatedDemographics) => {
		const { isLoading, isError, data } = await putUpdatePatientsDemographics(demographics, patient.picPatientId);

		if (isLoading) setLoading(true);

		if (isError) setError(true);

		if (data) {
			setLoading(false);
			setError(false);
			{/* @ts-ignore*/ }
			modalSaveHandler(demographics);
			{/* @ts-ignore*/ }
		}

	};

	const {mutate} = useMutation(putContact);

	return (
		<>
			<Modal show={show} onHide={() => handleModalClose()} centered>
				<Modal.Header closeButton className='border-bottom bg-light'>
					<Modal.Title className={'font-karla-bold modal-title mb-4'}>{t('mhic.patientDetailModal.contactInfoTab.contactTile.modalHeader')}</Modal.Title>
					{t('mhic.patientDetailModal.triageTab.triageTile.patient')}: {patient.displayName} {patient.familyName}
				</Modal.Header>
				<Modal.Body className='modal-body'>
					{error && (
						<Row className="mb-3"><p className={"text-danger"}>Error: An error occurred when updating patients contact information, Please try again </p></Row>
					)}
					<label htmlFor="describe-other-input">{t(t('mhic.patientDetailModal.contactInfoTab.contactTile.phoneLabel'))}</label>
					<input
						type="text"
						id="update-patient-number"
						className={'w-100 p-1 mb-2 text-dark'}
						value={updatePhone}
						onChange={(e) => handleUpdatePhone(e.target.value)}
					/>
					<label htmlFor="describe-other-input">{t('mhic.patientDetailModal.contactInfoTab.contactTile.emailLabel')}</label>
					<input
						type="text"
						id="update-patient-email"
						className={'w-100 p-1 text-dark'}
						value={updateEmail}
						onChange={(e) => handleUpdateEmail(e.target.value)}
					/>
					{error && <p>Enter a valid phone number or email</p>}
				</Modal.Body>
				<Modal.Footer className={'justify-content-end modal-footer'}>
					<Button variant="outline-primary" size="sm" onClick={() => handleModalClose()} className={'mr-1 mt-4'}>
						{t('mhic.modal.cancel')}
					</Button>
					<Button variant="primary" size="sm" onClick={() => handleModifyContactSave()} disabled={error} className='mt-4' data-cy='save-updated-contact-button'>
						{t('mhic.modal.save')}
					</Button>
				</Modal.Footer>
			</Modal>
			{ loading && <Spinner animation="border" className={'d-flex mx-auto mt-20'} />}
		</>
	);
};

export default ModifyPatientContactModal;
