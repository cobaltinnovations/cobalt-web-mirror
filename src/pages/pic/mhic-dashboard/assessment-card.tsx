// @ts-nocheck
import React, { FC, useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { Container, Row, Button, Col, ProgressBar, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { IQuestionnaireResponse } from '@ahryman40k/ts-fhir-types/lib/R4';
import { FormattedDisposition, FormattedPatientObject, questionnaireIdToNameMapping, TriageEnums, QuestionnaireResponse } from '@/pages/pic/utils';
import { useGetQuestionnaireResponsesByDispositionId } from '@/hooks/pic-hooks';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';
import Loader from '@/components/loader';

export enum questionnaireTypes {
	CSSRS = '/93373-9',
	GAD7 = '/69737-5',
	PHQ9 = '/44249-1',
	ISI = '/pic-isi',
	PCPTSD5 = '/pic-ptsd5',
	ASRM = '/pic-ASRM',
	PRIME5 = '/pic-PRIME5',
	BPI = '/77564-3',
	AUDIT_C = '/72109-2',
	DAST_10 = '/82666-9',
	OPIOID = '/pic-opioid-screen',
	PRE_PTSD = '/pic-pre-ptsd',
	SIMPLE_DRUG_AND_ALCOHOL = '/pic-simple-drug-alcohol',
	SIMPLE_PAIN = '/pic-simple-pain',
}

const validAssessments = [
	questionnaireTypes.CSSRS,
	questionnaireTypes.GAD7,
	questionnaireTypes.PHQ9,
	questionnaireTypes.ISI,
	questionnaireTypes.PCPTSD5,
	questionnaireTypes.ASRM,
	questionnaireTypes.PRIME5,
	questionnaireTypes.BPI,
	questionnaireTypes.AUDIT_C,
	questionnaireTypes.DAST_10,
];

const scoreMapping = [
	{ name: questionnaireTypes.GAD7, totalScore: 21 }, // GAD7
	{ name: questionnaireTypes.PHQ9, totalScore: 36 }, // PHQ-9
	{ name: questionnaireTypes.ASRM, totalScore: 20 }, // ASRM
	{ name: questionnaireTypes.AUDIT_C, totalScore: 12 }, // Audit C
	{ name: questionnaireTypes.BPI, totalScore: 110 }, // BPI
	{ name: questionnaireTypes.CSSRS, totalScore: 3 }, // Short-CSSRS
	{ name: questionnaireTypes.DAST_10, totalScore: 10 }, // Dast10
	{ name: questionnaireTypes.ISI, totalScore: 28 }, // ISI
	{ name: questionnaireTypes.PRIME5, totalScore: 30 }, // PRIME-5
	{ name: questionnaireTypes.PCPTSD5, totalScore: 5 }, // PTSD-5
];

interface Props {
	disposition: FormattedDisposition;
	patient: FormattedPatientObject;
}

const AssessmentCard: FC<Props> = (props) => {
	const { t } = useTranslation();
	const classes = usePICCobaltStyles();
	const history = useHistory();
	const { disposition, patient } = props;

	const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

	const { data: questionnaireResponses, isLoading, isError } = useGetQuestionnaireResponsesByDispositionId(disposition.id);

	if (isLoading) {
		return (
			<Container>
				<Loader />
			</Container>
		);
	}

	const filteredResponses = questionnaireResponses.filter((response) => validAssessments.includes(response.questionnaireType));

	const sortedResponsesByDate = filteredResponses.sort((d1, d2) => {
		return moment(d1.updatedDt).isBefore(moment(d2.updatedDt));
	});

	const latestAssessmentDate = sortedResponsesByDate.length > 0 ? moment(sortedResponsesByDate[0].updatedDt).format('MM / DD / YY') : null;

	const mappedResponses = filteredResponses.map((response) => {
		const totalScore = scoreMapping.find((mapping) => mapping.name === response.questionnaireType).totalScore;
		const patientScore = response.score;
		const scoreValue = (patientScore / totalScore) * 100;
		return {
			response: response.response,
			name: response.questionnaireType,
			scoreValue,
			patientScore,
			acuity: response.acuity,
		};
	});

	const filteredAssessments = mappedResponses.sort((a, b) => {
		return validAssessments.indexOf(a.name) - validAssessments.indexOf(b.name);
	});

	const determineAcuity = (acuity) => {
		switch (acuity) {
			case TriageEnums.low:
				return 'Mild';
			case TriageEnums.medium:
				return 'Moderate';
			case TriageEnums.high:
				return 'Severe';
			default:
				return '-';
		}
	};

	const determineClass = (acuity) => {
		switch (acuity) {
			case TriageEnums.low:
				return classes.low;
			case TriageEnums.medium:
				return classes.medium;
			case TriageEnums.high:
				return classes.high;
			default:
				return '';
		}
	};

	const routeToAssessment = () => {
		history.push(`/pic/mhic/disposition/${disposition.id}/assessment`);
	};

	const hideModal = () => {
		setSelectedAssessment(null);
	};
	const isAssessmentModalVisible = selectedAssessment !== null;
	const selectedAssessmentResponse = selectedAssessment ? filteredAssessments?.find((response) => response.name === selectedAssessment) : null;
	const selectedQuestionnaire: IQuestionnaireResponse = selectedAssessmentResponse?.response;
	const showStartButton = filteredAssessments.length === 0;

	return (
		<Container className={`border mb-3 h-100`} data-cy="triage-assessment-card">
			<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
				<Col md={'auto'}>
					<h5 className="font-karla-bold">{t('mhic.patientDetailModal.triageTab.assessmentScoresTile.title')}</h5>
				</Col>
				<Col sm={'auto'}>
					{showStartButton && (
						<Button className={'mx-auto mb-1 d-flex justify-self-end border'} variant="light" size="xsm" onClick={routeToAssessment}>
							{t('mhic.patientDetailModal.triageTab.assessmentScoresTile.modalButton')}
						</Button>
					)}
				</Col>
			</Row>
			{filteredAssessments.length > 0 ? (
				<>
					<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
						<Col sm={'auto'}>{t('mhic.patientDetailModal.triageTab.assessmentScoresTile.lastAssessmentLabel')}</Col>
						<Col sm={'auto'} data-cy="patient-last-assessment-label">
							{latestAssessmentDate}
						</Col>
					</Row>
					<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
						<Col sm={'auto'}>{t('mhic.patientDetailModal.triageTab.assessmentScoresTile.acuityLabel')}</Col>
						<Col sm={'auto'}>
							<span className={determineClass(disposition.acuity?.category)} />
							<span className="pl-1" data-cy="patient-acuity-label">
								{determineAcuity(disposition.acuity?.category)}
							</span>
						</Col>
					</Row>
					<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
						<Col sm={'auto'}>{t('mhic.patientDetailModal.triageTab.assessmentScoresTile.recommendationLabel')}</Col>
						<Col sm={'auto'}>{disposition.flag.label}</Col>
					</Row>
					<Row>
						<Container>
							{filteredAssessments.map((d, i) => (
								<Row className="align-items-center" key={d.name}>
									<Col sm={'auto'} className="m-1 mb-2 p-1">
										{questionnaireIdToNameMapping[d.name]}
									</Col>
									<Col className=" m-1 mb-2 p-1 d-block w-100">
										<ProgressBar now={d.scoreValue} />
									</Col>
									<Col
										sm={'auto'}
										className="m-1  mb-2 p-1 text-decoration-underline"
										onClick={() => {
											setSelectedAssessment(d.name);
										}}
										data-cy="assessment-modal-button"
									>
										{d.patientScore}
									</Col>
									<Col sm={'auto'} className="m-1 mb-2 p-1">
										<span className={determineClass(d.acuity)} />
									</Col>
								</Row>
							))}
						</Container>
					</Row>
				</>
			) : (
				<p>No Assessments</p>
			)}
			<Modal show={isAssessmentModalVisible} onHide={hideModal} centered>
				<Modal.Header closeButton>
					<Modal.Title className={'font-karla-bold'}>assessment score</Modal.Title>
					Patient: {patient.displayName} {patient.familyName}
				</Modal.Header>
				<Modal.Body className={'d-flex flex-column'}>
					{questionnaireIdToNameMapping[selectedAssessment]}
					<div className={'border my-3 p-3'}>
						{selectedQuestionnaire &&
							selectedQuestionnaire.item.map((response, i) => {
								return (
									<div key={i} className={'mb-2'}>
										<div className={'font-karla-bold'} dangerouslySetInnerHTML={{ __html: response.text }} />
										<div className={'mt-1 font-karla mb-2'}>
											<span className={'mr-2'}>{response.answer[0]?.valueCoding?.display}</span>
											{response.answer[0]?.extension &&
												response.answer[0]?.extension.length > 0 &&
												response.answer[0]?.extension[0]?.valueDecimal != null &&
												`- ${response.answer[0].extension[0]?.valueDecimal}`}
										</div>
									</div>
								);
							})}
					</div>
				</Modal.Body>
				<Modal.Footer className={'justify-content-end'}>
					<Button variant="outline-primary" size="sm" onClick={hideModal} className={'mr-1'}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default AssessmentCard;
