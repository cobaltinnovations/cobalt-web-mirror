import React, { FC, useState } from 'react';
import { Button, Modal} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { CreatedContact, FormattedPatientObject } from '@/pages/pic/utils';
import { referringLocationOptions, callResultOptions } from '@/assets/pic/formTemplates/contactInformationForm';
import { postContact  } from '@/hooks/pic-hooks';
import useAccount from '@/hooks/use-account';
interface Props {
	show: boolean;
	modalSaveHandler: () => void;
	modalCloseHandler: () => void;
	patient: FormattedPatientObject;
	dispositionId: string;
}

const ContactAttemptModal: FC<Props> = (props) => {
	const { t } = useTranslation();

	const { show, modalCloseHandler, modalSaveHandler, patient, dispositionId } = props;
	const { account } = useAccount();

	const [referringLocation, setReferringLocation] = useState<string | number>("");
	const [callResult, setCallResult] = useState<string | number>("");
	const [notesText, setNotesText] = useState("");

	const handleModalClose = () => {
		setNotesText("");
		setReferringLocation("");
		setCallResult("");

		modalCloseHandler();
	}

	const isDisabled = !(callResult !== "" && referringLocation !== "" && notesText);

	const handleLocationChange = (value: string) => {
		const id = parseInt(value);
		setReferringLocation(id)
	}

	const handleCallResultChange = (value: string) => {
		const id = parseInt(value);
		setCallResult(id)
	}

	const handleContactAttemptSave = () => {
		const contact = {
			id: dispositionId,
			authoredBy: `${account?.firstName}, ${account?.lastName}`,
			note: notesText,
			callResult: callResult,
			referringLocation: referringLocation,
		}

		// @ts-ignore
		mutate(contact);
	};

	const postContactAttempt = async (contact: CreatedContact) => {
		await postContact(contact, dispositionId);

		setNotesText("");
		setReferringLocation("");
		setCallResult("")

		{/* @ts-ignore*/ }
		modalSaveHandler(contact);
		{/* @ts-ignore*/ }


	};

	const {mutate} = useMutation(postContactAttempt);

	return (
		<Modal show={show} onHide={() => handleModalClose()} centered>
			<Modal.Header closeButton className='border-bottom bg-light'>
				<Modal.Title className={'font-karla-bold modal-title mb-3'}>{t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.modalHeader')}</Modal.Title>
				{t('mhic.patientDetailModal.triageTab.triageTile.patient')}: {patient.displayName} {patient.familyName}
			</Modal.Header>
			<Modal.Body className={'d-flex flex-column modal-body'}>
				<label className='my-1'> {t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.referringLocation')}</label>
				<select value={referringLocation} onChange={(e) => handleLocationChange(e.target.value)} className={'my-2'} name='contactHistory'>
					{/* @ts-ignore*/}
					<option value="" defaultValue disabled hidden>
						Select
					</option>
					{referringLocationOptions.map((option, i) => (
						<option key={i} value={option.id}>
							{option.label}
						</option>
					))}
				</select>
				<label className='my-1'>{t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.callResult')}</label>
				<select className={'my-2'} value={callResult} onChange={(e) => handleCallResultChange(e.target.value)} name='contactCallResult'>
					{/* @ts-ignore*/}
					<option value="" defaultValue disabled hidden>
						Select
						</option>
					{callResultOptions.map((option, i) => (
						<option key={i} value={option.id}>
							{option.label}
						</option>
					))}
				</select>

				<label htmlFor="describe-other-input" className='my-1'>{t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.notes')}</label>
				<input
					name='contactAttemptComment'
					type="text"
					id="describe-other-input"
					className={'w-100 h-30 p-1 text-dark'}
					value={notesText}
					maxLength={255}
					onChange={(e) => setNotesText(e.target.value)}
				/>
			</Modal.Body>
			<Modal.Footer className={'justify-content-end modal-footer'}>
				<Button variant="outline-primary" size="sm" onClick={() => handleModalClose()} className={'mr-1 mt-4'}>
					{t('mhic.modal.cancel')}
				</Button>
				<Button variant="primary" size="sm" onClick={() => handleContactAttemptSave()} className='mt-4' data-cy='contact-attempt-save-button' disabled={isDisabled}>
					{t('mhic.modal.save')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ContactAttemptModal;
