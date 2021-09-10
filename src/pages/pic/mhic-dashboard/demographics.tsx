// @ts-nocheck
import React, { FC, useState, useEffect } from 'react';
import moment from 'moment'
import { Col, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FormattedDisposition, FormattedPatientObject, UpdatedDemographics, } from '@/pages/pic/utils';
import PatientDetailCard from '@/pages/pic/mhic-dashboard/patient-detail-card';
import { DemographicsModal } from '@/pages/pic/mhic-dashboard/demographicsModals';
import PatientScheduleDetailCard from '@/pages/pic/mhic-dashboard/patient-schedule-detail-card';

interface Props {
	patient: FormattedPatientObject,
	disposition: FormattedDisposition,
	onScheduleChange?: () => void;
}

const Demographics: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { patient, disposition } = props;
	const [showDemographicsModal, setDemographicsModal] = useState(false);
	const [modifiedPatient, setModifiedPatient] = useState<undefined |FormattedPatientObject>(undefined);

	useEffect(() => {
		setModifiedPatient(patient);
	}, [patient, disposition])

	const cleanInsuranceProvider = () => {
		let cleanString = '';

		if (disposition.orders[0]?.insurance) {
			const wordArray = disposition.orders[0]?.insurance.split(" ");
			const withInsuranceCode = wordArray.shift()
			const spiltInsuranceCode = withInsuranceCode.split('-');
			const insuranceCode = spiltInsuranceCode[0];
			const insuranceName = [spiltInsuranceCode[1], ...wordArray].reduce((string, el) => {
				const lowerCaseWords = lowerCaseAllWordsExceptFirstLetters(el);
				string = `${string} ${lowerCaseWords}`;
				return string;
			}, '');

			cleanString = `${insuranceCode} ${insuranceName}`;
		}

		return cleanString;
	}

	const determineOrderProvider = () =>  {
		let reorderedName = '';

		if (disposition.orders[0]?.orderingProvider) {
			const nameArray = disposition.orders[0]?.orderingProvider.split(" ");
			const cleanLastName = nameArray[0].split(','); // remove extra commas from name
			const cleanFirstName = nameArray[1].split(',');  // remove extra commas from name

			reorderedName = `${cleanFirstName[0]} ${cleanLastName[0]}`;
		}

		return reorderedName;
	}

	const determineBillingProviderName = () =>  {
		let reorderedName = '';

		if (disposition.orders[0]?.billingProvider) {
			const nameArray = disposition.orders[0]?.billingProvider.split(" ");
			const cleanLastName = nameArray[0].split(','); // remove extra commas from name
			const cleanFirstName = nameArray[1].split(',');  // remove extra commas from name
			const lastName = lowerCaseAllWordsExceptFirstLetters(cleanLastName[0]);
			const firstName = lowerCaseAllWordsExceptFirstLetters(cleanFirstName[0]);
			const billingCode = nameArray[2];

			reorderedName = `${firstName} ${lastName} ${billingCode}`;
		}

		return reorderedName;
	}

	const lowerCaseAllWordsExceptFirstLetters = (string = '') => {
		return string.replace(/\S*/g, function (word) {
			return word.charAt(0) + word.slice(1).toLowerCase();
		});
	}

	const careTeamData = [
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.orderingProvider'),
			data: disposition.orders && disposition.orders.length > 0 ? determineOrderProvider() : '',
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.billingProvider'),
			data: disposition.orders && disposition.orders.length > 0 ? determineBillingProviderName() : '',
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.pcProvider'),
			data: patient.careTeam && patient.careTeam[0].display,
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.mhicProvider'),
			data: 'Ava Williams', //TODO: mhic provider hardcoded data for pilot launch, will need to be updated once more mhic's are in system
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.bhpProvider'),
			data: 'Lisa Vallee', //TODO: bhp provider hardcoded data for pilot launch, will need to be updated once more bhp's are in system
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.careTeamTile.psychiatristProvider'),
			data: 'Erin Torday' //TODO: psychiatrist provider hardcoded data for pilot launch, will need to be updated once more psychiatrists are in system
		}
	];

	const demographicData = [
		{
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.mrn'),
			data: disposition?.orders && disposition.orders.length > 0 ? disposition.orders[0]?.mrn : '',
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.dob'),
			data: modifiedPatient?.dob ? modifiedPatient?.dob : '',
		},
		{
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.age'),
			data: modifiedPatient?.age ? modifiedPatient?.age : '',
		}, {
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.insurance'),
			data: disposition?.orders && disposition.orders.length > 0 ? cleanInsuranceProvider() : '',
		}, {
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.language'),
			data: modifiedPatient?.language ? modifiedPatient?.language : '',
		}, {
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.zip'),
			data: modifiedPatient?.zip ? modifiedPatient?.zip : '',
		}, {
			label: t('mhic.patientDetailModal.demographicsTab.demographicsTile.engagement'),
			data: disposition.preferredEngagement,
		}
	];

	const toggleDemographicsModal = () => setDemographicsModal(!showDemographicsModal);
	const handleSaveDemographicsModal = (demographics: UpdatedDemographics) =>  {
		const dob = moment(demographics.dob).format('MM/DD/YYYY');
		const age =  moment().diff(demographics.dob, 'years');
		const newPatient = Object.assign({}, modifiedPatient, demographics, { dob: dob, age: age, language: demographics.preferredLanguage });
		setModifiedPatient(newPatient);
		setDemographicsModal(!showDemographicsModal);
	}

	const handleOnClick = () => {}

	return (
		<>
		{
			modifiedPatient ? (
					<Row className='p-2 m-2 d-flex justify-content-between' data-cy='demographics-tab-content'>
						<Col data-cy='demographics-col'>
							<PatientDetailCard
								title={t('mhic.patientDetailModal.demographicsTab.demographicsTile.title')}
								buttonText={t('mhic.patientDetailModal.demographicsTab.demographicsTile.modalButton')}
								modalClickHandler={toggleDemographicsModal}
								data={demographicData}
								isDisabled={false}
								type={'demographic'}
								dataCy={'edit-demographics-button'}
							/>
							<DemographicsModal show={showDemographicsModal} saveClickHandler={handleSaveDemographicsModal} closeClickHandler={toggleDemographicsModal} patient={modifiedPatient} />
						</Col>
						<Col className='d-flex flex-column justify-content-between'>
							<PatientDetailCard
								title={t('mhic.patientDetailModal.demographicsTab.careTeamTile.title')}
								buttonText={t('mhic.patientDetailModal.demographicsTab.careTeamTile.modalButton')}
								modalClickHandler={handleOnClick}
								data={careTeamData}
								isDisabled={true}
								type={'careTeam'}
							/>
							{
								patient.cobaltAccountId !== null &&
								(<PatientScheduleDetailCard
									disposition={disposition}
									picPatientId={patient.picPatientId}
									patientCobaltAccountId={patient.cobaltAccountId}
									patientDisplayName={patient.displayName}
									onScheduleChange={props.onScheduleChange}
								/>)
							}
						</Col>
					</Row >
			) : (<Spinner animation="border" className={'d-flex mx-auto mt-20'} />)
		}
		</>
	);

}

export default Demographics;
