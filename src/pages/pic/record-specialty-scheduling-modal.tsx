import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import { postSpecialtyScheduling } from '@/hooks/pic-hooks';
import useHandleError from '@/hooks/use-handle-error';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, ModalProps, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import InputMask from 'react-input-mask';
import { Disposition } from './utils';
interface PicRecordSpecialtyScheduling extends ModalProps {
	disposition: Disposition;
	patientAccountId: string;
	patientName: string;
	onSuccess: () => void;
}

export const PicRecordSpecialtySchedulingModal: FC<PicRecordSpecialtyScheduling> = (props) => {
	const handleError = useHandleError();
	const { t } = useTranslation();

	const [agency, setAgency] = useState('');
	const [date, setDate] = useState<moment.Moment>(moment());
	const [time, setTime] = useState('');
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [refNotes, setRefNotes] = useState('');

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!props.show) {
			setIsLoading(false);
			if (props.disposition.specialtyCareScheduling) {
				const spc = props.disposition.specialtyCareScheduling;
				spc.agency && setAgency(spc.agency);
				spc.date && setDate(moment(spc.date));
				spc.time && setTime(spc.time);
				typeof spc.notes === 'string' && setRefNotes(spc.notes);
				typeof spc.attendanceConfirmed === 'boolean' && setIsConfirmed(spc.attendanceConfirmed);
			} else {
				setAgency('');
				setDate(moment());
				setTime('');
				setRefNotes('');
				setIsConfirmed(false);
			}
		}
	}, [props.show, props.disposition]);

	return (
		<Modal size="lg" centered show={props.show} onHide={props.onHide}>
			<Modal.Header closeButton className="border-bottom bg-light">
				<h4>{t('pic.recordSpecialtySchedulingModal.title', 'record specialty care scheduling')}</h4>
				<p>
					{t('pic.recordSpecialtySchedulingModal.subtitle', 'Patient: {{patientName}}', {
						patientName: props.patientName,
					})}
				</p>
			</Modal.Header>

			<Modal.Body>
				<Row>
					<Col md={6}>
						<p className="font-karla-bold">Appointment</p>
						<Form.Group controlId="agency" className="my-3">
							<InputHelper
								name="agency"
								label="Agency"
								value={agency}
								onChange={(e) => {
									setAgency(e.target.value);
								}}
							/>
						</Form.Group>

						<DatePicker
							showYearDropdown
							showMonthDropdown
							dropdownMode="select"
							selected={date.toDate()}
							onChange={(date) => {
								setDate(moment(date));
							}}
						/>

						<Form.Group controlId="time" className="my-3">
							<InputHelper
								as={InputMask}
								//@ts-expect-error InputHelper `as` type forwarding
								mask="99:99"
								maskChar="_"
								name="time"
								label="Time (optional)"
								value={time}
								onChange={(e) => {
									setTime(e.target.value);
								}}
							/>
						</Form.Group>

						{props.disposition.specialtyCareScheduling && (
							<Form.Check
								type="checkbox"
								bsPrefix="cobalt-modal-form__check"
								name="confirmed"
								id="confirmed"
								label="Attendance Confirmed"
								className="ml-2"
								checked={isConfirmed}
								onChange={(e) => {
									setIsConfirmed(!isConfirmed);
								}}
							/>
						)}
					</Col>
					<Col md={6}>
						<p className="font-karla-bold">Referral Notes</p>
						<Form.Group controlId="notes" className="my-3">
							<InputHelper
								as="textarea"
								name="notes"
								label=""
								value={refNotes}
								onChange={(e) => {
									setRefNotes(e.target.value);
								}}
							/>
						</Form.Group>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer className="border-top bg-light pt-4 d-flex justify-content-end">
				<Button
					size="sm"
					variant="outline-primary"
					className="mr-2"
					onClick={() => {
						if (props.onHide) {
							props.onHide();
						}
					}}
				>
					{t('pic.recordSpecialtySchedulingModal.actions.cancel', 'cancel')}
				</Button>

				<Button
					size="sm"
					variant="primary"
					disabled={isLoading || !agency || !date}
					onClick={() => {
						const data = {
							agency,
							date: date.format('YYYY-MM-DD'),
							time,
							notes: refNotes,
							attendanceConfirmed: isConfirmed,
						};
						postSpecialtyScheduling(data, props.disposition.id)
							.then(() => {
								props.onSuccess();
							})
							.catch(handleError);
					}}
				>
					{t('pic.recordSpecialtySchedulingModal.actions.save', 'save')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PicRecordSpecialtySchedulingModal;
