// @ts-nocheck
import React, { FC, useState, useEffect } from 'react';
import { Col, Row, Container, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { MHICDisposition, FormattedPatientObject, Contact, CallResultType, CallResultIdType } from '@/pages/pic/utils';
import ContactAttemptModal from '@/pages/pic/mhic-dashboard/contact-attempt-modal';
import ModifyPatientContactModal from '@/pages/pic/mhic-dashboard/modify-patient-contact-modal';

interface Props {
	patient: FormattedPatientObject;
	disposition: MHICDisposition;
}

const contactCallResultMapping = (callResult) => {
	switch (callResult) {
		case CallResultType.LEFT_VOICE_MAIL:
			return 'Left voice mail';
		case CallResultType.LEFT_MESSAGE:
			return 'Left message';
		case CallResultType.NO_ANSWER:
			return 'No Answer';
		case CallResultType.BUSY:
			return 'Busy';
		case CallResultType.DISCONNECTED_WRONG_NUMBER:
			return 'Disconnected / wrong number';
		case CallResultType.DISCUSSED_APPOINTMENT_TIME:
			return 'Discussed appointment time';
		case CallResultType.DISCUSSED_DIGITAL_SCREENING_REMINDER:
			return 'Discussed digital screening reminder';
		case CallResultType.SENT_EMAIL:
			return 'Sent email';
		case CallResultType.SENT_TEXT_MESSAGE:
			return 'Sent text message';
		case CallResultType.SENT_LETTER:
			return 'Sent letter';
		default:
			return '';
	}
};

const contactCallResultIdMapping = (id) => {
	switch (id) {
		case CallResultIdType.LEFT_VOICE_MAIL:
			return 'LEFT_VOICE_MAIL';
		case CallResultIdType.LEFT_MESSAGE:
			return 'LEFT_MESSAGE';
		case CallResultIdType.NO_ANSWER:
			return 'NO_ANSWER';
		case CallResultIdType.BUSY:
			return 'BUSY';
		case CallResultIdType.DISCONNECTED_WRONG_NUMBER:
			return 'DISCONNECTED_WRONG_NUMBER';
		case CallResultIdType.DISCUSSED_APPOINTMENT_TIME:
			return 'DISCUSSED_APPOINTMENT_TIME';
		case CallResultIdType.DISCUSSED_DIGITAL_SCREENING_REMINDER:
			return 'DISCUSSED_DIGITAL_SCREENING_REMINDER';
		case CallResultIdType.SENT_EMAIL:
			return 'SENT_EMAIL';
		case CallResultIdType.SENT_TEXT_MESSAGE:
			return 'SENT_EMAIL';
		case CallResultIdType.SENT_LETTER:
			return 'SENT_LETTER';
		default:
			return '';
	}
};

const ContactInfo: FC<Props> = (props) => {
	const { t } = useTranslation();
	const [updatedEmail, setUpdatedEmail] = useState('');
	const [updatedPhone, setUpdatedPhone] = useState('');
	const [isContactModalVisible, setIsContactModalVisible] = useState(false);
	const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
	const [contacts, setContacts] = useState<undefined | Contact[]>(undefined);

	const { patient, disposition } = props;

	useEffect(() => {
		setContacts(disposition.contact);
	}, [disposition]);

	// Edit contact modal update
	const handleInfoModalState = () => setIsInfoModalVisible(!isInfoModalVisible);
	const handleInfoModalSaveClose = (contact) => {
		const { email, phone } = contact;
		setUpdatedEmail(email);
		setUpdatedPhone(phone);
		handleInfoModalState();
	};

	// Contact attempt modal update
	const handleContactAttemptModalState = () => setIsContactModalVisible(!isContactModalVisible);
	const handleContactModalSaveClose = (contact: Contact) => {
		const callResultMapping = contactCallResultIdMapping(contact.callResult);
		const newContact = Object.assign({}, contact, { callResult: callResultMapping });
		setContacts([newContact, ...contacts]);
		handleContactAttemptModalState();
		mutate(contact);
	};

	return (
		<Row className="p-2 m-2 d-flex justify-content-between" data-cy="contact-info-tab-content">
			<Col className={'border px-3 mx-3'}>
				<Row className="align-items-center mt-2 pt-1 mb-2">
					<Col md={'auto'}>
						<h5 className="font-karla-bold">{t('mhic.patientDetailModal.contactInfoTab.contactTile.title')}</h5>
					</Col>
					<Col sm={'auto'}>
						<Button
							className={'mx-auto mb-1 d-flex justify-self-end border'}
							variant="light"
							size="sm"
							onClick={handleInfoModalState}
							data-cy="edit-contact-button"
						>
							{t('mhic.patientDetailModal.contactInfoTab.contactTile.modalButton')}
						</Button>
					</Col>
				</Row>
				<Container>
					{patient?.phoneNumbers &&
						patient?.phoneNumbers.length > 0 &&
						patient?.phoneNumbers.map((phone) => {
							const isPreferredMethod = patient.preferredPhoneMethod === phone.use;
							return (
								<>
									<Row className="font-karla-bold mb-3">{t('mhic.patientDetailModal.contactInfoTab.contactTile.mainPhoneLabel')}</Row>
									<Row className="font-karla-bold mb-2">{t(`mhic.patientDetailModal.contactInfoTab.contactTile.${phone.use}PhoneLabel`)}</Row>
									<Row className="mb-2">
										{isPreferredMethod && updatedPhone ? updatedPhone : phone.value}
										<span className="mr-2">{isPreferredMethod ? '*' : ''}</span>
									</Row>
								</>
							);
						})}
					{patient?.email && (
						<>
							<Row className="font-karla-bold my-2">{t('mhic.patientDetailModal.contactInfoTab.contactTile.emailLabel')}</Row>
							<Row className="mb-4" data-cy="contact-info-patient-email">
								{updatedEmail ? updatedEmail : patient.email}
							</Row>
						</>
					)}
				</Container>
			</Col>
			<Col className={'border px-3 mx-3'}>
				<Row className="align-items-center mt-2 pt-1 mb-2 justify-content-between">
					<Col md={'auto'}>
						<h5 className="font-karla-bold">{t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.title')}</h5>
					</Col>
					<Col sm={'auto'}>
						<Button
							className={'mx-auto mb-1 d-flex justify-self-end border'}
							variant="light"
							size="sm"
							onClick={handleContactAttemptModalState}
							data-cy="add-contact-attempt-button"
						>
							{t('mhic.patientDetailModal.contactInfoTab.contactHistoryTile.modalButton')}
						</Button>
					</Col>
				</Row>
				<div className={`border p-0`} data-cy="contact-history-log">
					{contacts &&
						contacts.map((contact, index) => {
							return (
								<div className={`${index % 2 !== 0 ? 'bg-light-gray' : ''} font-size-xxs px-3 m-0 mb-2`}>
									<Row key={`${contact.createdAt}${index}`} className={`d-flex py-1 font-size-xxs p-0 m-0`}>
										<Col className="p-0">
											<div className={'font-weight-bold font-size-s'} data-cy="contact-call-result-label">
												{contactCallResultMapping(contact.callResult)}
											</div>
											<div></div>
										</Col>
										<Col className={'text-right p-0'}>
											<div>{moment(contact.createdAt).format('MM/DD/YY h:mm a')}</div>
											<div>{contact.authoredBy}</div>
										</Col>
									</Row>
									<Row className="p-0 m-0 pb-2">
										<div data-cy="contact-attempt-comment-label p-2">{contact.note}</div>
									</Row>
								</div>
							);
						})}
				</div>
			</Col>
			<ModifyPatientContactModal
				show={isInfoModalVisible}
				modalSaveHandler={handleInfoModalSaveClose}
				modalCloseHandler={handleInfoModalState}
				patient={patient}
			/>
			<ContactAttemptModal
				show={isContactModalVisible}
				modalSaveHandler={handleContactModalSaveClose}
				modalCloseHandler={handleContactAttemptModalState}
				patient={patient}
				dispositionId={disposition.id}
			/>
		</Row>
	);
};

export default ContactInfo;
