// @ts-nocheck
import React, { FC, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Col, Row, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FormattedDisposition, FormattedPatientObject, getFormattedPatientObject, FlagType } from '@/pages/pic/utils';
import { useGetPicPatientById } from '@/hooks/pic-hooks';
import Demographics from '@/pages/pic/mhic-dashboard/demographics';
import Triage from '@/pages/pic/mhic-dashboard/triage';
import ContactInfo from '@/pages/pic/mhic-dashboard/contactInfo';
import Notes from '@/pages/pic/mhic-dashboard/notes';
import { ReactComponent as Flag } from '@/assets/pic/flag_icon.svg';
import { ReactComponent as Safety } from '@/assets/pic/safety_icon.svg';
import Loader from '@/components/loader';
interface Props {
	selectedDispositionId: string;
	disposition: FormattedDisposition;
	onScheduleChange?: () => void;
	onCloseClick: () => void;
}

const PatientDetailView: FC<Props> = (props) => {
	const { t } = useTranslation();
	const [selectedTab, setSelectedTab] = useState('demographics');

	const { onCloseClick, selectedDispositionId, disposition } = props;

	const { data: rawPatient, isLoading } = useGetPicPatientById(disposition.patient.id);
	if (isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	const patient = getFormattedPatientObject(rawPatient);

	const handleTabClick = (tab) => {
		setSelectedTab(tab);
	};

	const determineTab = () => {
		switch (selectedTab) {
			case 'demographics':
				return <Demographics patient={patient} disposition={disposition} onScheduleChange={props.onScheduleChange} />;
			case 'triage':
				return <Triage patient={patient} disposition={disposition} />;
			case 'contactInfo':
				return <ContactInfo patient={patient} disposition={disposition} />;

			case 'notes':
				return <Notes patient={patient} disposition={disposition} />;
		}
	};

	return (
		<Col className="bg-white p-1 m-2" data-cy={'mhic-patient-view'}>
			{disposition && patient && (
				<>
					<Row className="justify-content-between p-2 m-2 align-items-flex-end">
						<Col md={'auto'}>
							<h4 className="font-karla-bold">
								{patient.displayName ? patient.displayName : ''} {patient.familyName ? patient.familyName : ''}
							</h4>
							<p>
								{disposition.flag && disposition.flag.type === FlagType.Safety ? (
									<Safety />
								) : disposition.flag.type === FlagType.General ? (
									<Flag />
								) : (
									''
								)}
								{disposition.flag && disposition.flag.label ? disposition.flag.label : ''}
							</p>
						</Col>
						<Col sm={'auto'}>
							<Button size={'xsm'} variant={'light'} onClick={() => onCloseClick()}>
								Ⅹ
							</Button>
						</Col>
					</Row>
					<Row className="justify-content-between m-2 border-bottom">
						<Col
							sm={'auto'}
							className={`${selectedTab === 'demographics' ? 'selected-border-bottom' : 'no-border'} d-inline-flex font-karla-bold`}
							onClick={() => handleTabClick('demographics')}
							data-cy="demographics-tab"
						>
							{t('mhic.patientDetailModal.accordion.demographicsLabel')}
						</Col>
						<Col
							sm={'auto'}
							className={`${selectedTab === 'triage' ? 'selected-border-bottom' : 'no-border'} d-inline-flex font-karla-bold`}
							onClick={() => handleTabClick('triage')}
							data-cy="triage-tab"
						>
							{t('mhic.patientDetailModal.accordion.triageLabel')}
						</Col>
						<Col
							sm={'auto'}
							className={`${selectedTab === 'contactInfo' ? 'selected-border-bottom' : 'no-border'} d-inline-flex font-karla-bold`}
							onClick={() => handleTabClick('contactInfo')}
							data-cy="contact-info-tab"
						>
							{t('mhic.patientDetailModal.accordion.contactInfoLabel')}
						</Col>

						<Col
							sm={'auto'}
							className={`${selectedTab === 'notes' ? 'selected-border-bottom' : 'no-border'} d-inline-flex font-karla-bold disabled`}
							onClick={() => handleTabClick('notes')}
							data-cy="notes-tab"
						>
							{t('mhic.patientDetailModal.accordion.notesLabel')}
						</Col>
					</Row>
					{determineTab()}
				</>
			)}
			{!patient && <Loader />}
		</Col>
	);
};

export default PatientDetailView;
