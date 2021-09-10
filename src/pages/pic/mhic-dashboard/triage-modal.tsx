// @ts-nocheck
import React, { FC, useState, useEffect } from 'react';
import { Button, Modal, Row, Col, Spinner } from 'react-bootstrap';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { triagesPICOptions, triagesSpecialtiesOptions, triages } from '@/assets/pic/formTemplates/triageInformationForm';
import { FormattedPatientObject, UpdatedOutcome, UpdatedStatus, Outcome } from '@/pages/pic/utils';
import { useMutation, useQueryClient } from 'react-query';
import { putOutcome, putFlag } from '@/hooks/pic-hooks';
import { usePrevious } from '@/hooks/use-previous';
import TriageRadioButton from '@/pages/pic/mhic-dashboard/traige-radio-button';
interface Props {
	patient: FormattedPatientObject;
	outcome: Outcome | null;
	displayTriage: string;
	show: boolean;
	saveClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	closeClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	id: string;
}

enum Care {
	pic = 'PIC',
	specialty = 'Specialty',
}

export const TriageModal: FC<Props> = ({ show, saveClickHandler, closeClickHandler, outcome, patient, id, displayTriage }) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [triageDiagnosis, setTriageDiagnosis] = useState(outcome ? outcome.diagnosis?.code : null);

	// Reset the form when underlying data changes, or when form is shown
	React.useEffect(() => {
		setTriageDiagnosis(outcome?.diagnosis?.code);
	}, [outcome, show]);

	const hasBeenUpdated = triageDiagnosis !== outcome?.diagnosis?.code;

	const handleClose = () => {
		closeClickHandler();
	};

	const handleUpdateTriageButton = (diagnosis) => {
		setTriageDiagnosis(diagnosis);
	};

	const handleUpdateTriageSave = () => {
		// Graduated/Connected to Care/Lost Contact are special cases (flags instead of outcomes)
		const updateFlag = triageDiagnosis === 16 || triageDiagnosis === 17 || triageDiagnosis === 18;

		// send to update outcome
		if (hasBeenUpdated && !updateFlag) {
			// Not a graduated flag - Send update to /outcome
			const outcome = {
				code: triageDiagnosis,
			};

			putOutcomeMutation(outcome);
		}

		// send to update flag
		if (hasBeenUpdated && updateFlag) {
			// update flag as Graduated - send update to /flag
			const status = {
				id: triageDiagnosis,
			};

			putFlagMutation(status);
		}
	};

	const { mutate: putOutcomeMutation, isLoading: outcomeLoading, isError: outcomeError } = useMutation((outcome: UpdatedOutcome) => putOutcome(outcome, id), {
		onSuccess: () => {
			queryClient.invalidateQueries('disposition');
			saveClickHandler();
		},
	});

	const { mutate: putFlagMutation, isLoading: flagLoading, isError: flagError } = useMutation((status: UpdatedStatus) => putFlag(status, id), {
		onSuccess: () => {
			queryClient.invalidateQueries('disposition');
			saveClickHandler();
		},
	});

	const loading = outcomeLoading || flagLoading;
	const error = outcomeError || flagError;

	return (
		<>
			<Modal show={show} onHide={() => handleClose()}>
				<Modal.Header closeButton className="border-bottom bg-light">
					<Modal.Title className="font-karla-bold mb-2 modal-title mb-3">{t('mhic.patientDetailModal.triageTab.triageTile.modalButton')}</Modal.Title>
					<p className="mb-1">
						{t('mhic.patientDetailModal.triageTab.triageTile.patient')}: {patient.displayName} {patient.familyName}
					</p>
				</Modal.Header>
				<Modal.Body className="modal-body">
					{error && (
						<Row className="mb-3">
							<p className={'text-danger'}>Error: An error occurred when updating patients Triage, Please try again </p>
						</Row>
					)}
					<Row className="mb-3">
						<Col className="font-karla"> {t('mhic.patientDetailModal.triageTab.triageTile.modalHeader')}</Col>
						<Col className="font-karla-bold" data-cy="triage-label">
							{displayTriage}
						</Col>
					</Row>
					<Row>
						<Col className="font-karla mb-1">{t('mhic.patientDetailModal.triageTab.triageTile.modalButton')}:</Col>
					</Row>
					<Row className="p-2 d-flex">
						<Col sm={'auto'} className="pr-0 p-1 ml-2">
							{triagesPICOptions.map((triage) => (
								<TriageRadioButton
									key={triage.value.diagnoses}
									triage={triage}
									handleUpdateTriage={handleUpdateTriageButton}
									triageDiagnosis={triageDiagnosis}
								/>
							))}
						</Col>
						<Col sm={'auto'} className="pr-0 p-1 ml-2">
							{triagesSpecialtiesOptions.map((triage) => (
								<TriageRadioButton
									key={triage.value.diagnoses}
									triage={triage}
									handleUpdateTriage={handleUpdateTriageButton}
									triageDiagnosis={triageDiagnosis}
								/>
							))}
						</Col>
					</Row>
				</Modal.Body>
				<Modal.Footer className="bg-light justify-content-end modal-footer">
					<Button variant="outline-primary" onClick={() => handleClose()} className="mr-1 mt-4" data-cy="close-triage-mo">
						{t('mhic.modal.cancel')}
					</Button>
					<Button
						variant="primary"
						onClick={() => handleUpdateTriageSave()}
						disabled={!hasBeenUpdated}
						className="mt-4"
						data-cy="update-triage-save-button"
					>
						{t('mhic.modal.save')}
					</Button>
				</Modal.Footer>
			</Modal>
			{loading && <Spinner animation="border" className={'d-flex mx-auto mt-20'} />}
		</>
	);
};

export default TriageModal;
