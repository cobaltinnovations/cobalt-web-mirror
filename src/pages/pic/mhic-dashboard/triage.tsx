import React, { FC, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FormattedPatientObject, FormattedDisposition } from '@/pages/pic/utils';
import PatientDetailCard from '@/pages/pic/mhic-dashboard/patient-detail-card';
import AssessmentCard from '@/pages/pic/mhic-dashboard/assessment-card';
import TriageCard from '@/pages/pic/mhic-dashboard/triage-card';
import TriageModal from '@/pages/pic/mhic-dashboard/triage-modal';
import moment from 'moment';

interface Props {
	patient: FormattedPatientObject;
	disposition: FormattedDisposition;
}

const Triage: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { patient, disposition } = props;
	const [showTriageModal, setTriageModal] = useState(false);

	const dispositionOrders = disposition?.orders ?? undefined;
	const sortedOrders = useMemo(() => {
		return (
			dispositionOrders?.sort((d1, d2) => {
				const d1Moment = moment(d1.orderDate);
				const d2Moment = moment(d2.orderDate);
				return d1Moment.isBefore(d2Moment) ? 1 : d1Moment.isAfter(d2Moment) ? -1 : 0;
			}) ?? []
		);
	}, [dispositionOrders]);

	const cleanContent = (data: string) => {
		let cleanString = '';
		if (data !== null && data.length > 0) {
			const removeDxCodes = data.split(/[[\d+\]]/);
			const removeWhiteSpace = removeDxCodes.filter(Boolean);

			cleanString = removeWhiteSpace.reduce((string, character, index) => {
				if (character) {
					string = `${string} ${character} ${index === removeWhiteSpace.length - 1 ? '' : ','}`;
				}

				return string;
			}, '');
		}
		return cleanString;
	};

	const clinicalInfoData = [
		{
			label: t('mhic.patientDetailModal.triageTab.clinicalInfoTile.diagnosesLabel'),
			data: sortedOrders.length > 0 ? cleanContent(sortedOrders[0]?.dx) : '',
		},
		{
			label: t('mhic.patientDetailModal.triageTab.clinicalInfoTile.medicationsLabel'),
			data: sortedOrders.length > 0 ? cleanContent(sortedOrders[0]?.medications) : '',
		},
		{
			label: t('mhic.patientDetailModal.triageTab.clinicalInfoTile.reasonForReferral'),
			data: sortedOrders.length > 0 ? sortedOrders[0]?.reasonForReferral : '',
		},
		{
			label: t('mhic.patientDetailModal.triageTab.clinicalInfoTile.evaluationLabel'),
			data: sortedOrders.length > 0 ? sortedOrders[0]?.orderDate : '',
		},
	];

	const toggleTriageModal = () => setTriageModal(!showTriageModal);
	const handleSaveTriageModal = () => {
		setTriageModal(!showTriageModal);
	};

	const handleOnClick = () => {
		//
	};

	return (
		<Row className="p-2 m-2 d-flex justify-content-between" data-cy="triage-tab-content">
			<Col className="col-m-3 d-flex flex-column justify-content-between">
				<TriageCard modalClickHandler={toggleTriageModal} disposition={disposition} />
				<TriageModal
					show={showTriageModal}
					saveClickHandler={handleSaveTriageModal}
					closeClickHandler={toggleTriageModal}
					outcome={disposition.outcome}
					patient={patient}
					id={disposition.id}
					displayTriage={disposition.displayTriage || ''}
				/>
				<PatientDetailCard
					title={t('mhic.patientDetailModal.triageTab.clinicalInfoTile.title')}
					buttonText={t('mhic.patientDetailModal.triageTab.clinicalInfoTile.modalButton')}
					data={clinicalInfoData}
					modalClickHandler={handleOnClick}
					isDisabled={true}
					type={'triage'}
				/>
			</Col>
			<Col className="col-m-3">
				<AssessmentCard patient={patient} disposition={disposition} />
			</Col>
		</Row>
	);
};

export default Triage;
