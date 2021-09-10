import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup, Button, Col, Container, Spinner } from 'react-bootstrap';
import { OptionsList, Option } from '@/pages/pic/assessment/options-list';
import { diagnosesOptions, symptomsOptions } from '@/assets/pic/formTemplates/lookingForDiagnosisTemplates';
import { stringQuestionnaireResponse, optionsToQuestionnaireResponse, getSingleAnswer } from '@/pages/pic/assessment/assessment-utils';
import { useSubmitResponse } from '@/hooks/pic-hooks';
import { useHistory, Redirect } from 'react-router-dom';
import { IQuestionnaireResponse } from '@ahryman40k/ts-fhir-types/lib/R4';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';

const LINK_ID = '/looking-for';

interface Props {
	assessmentId: string;
	previousUrl: string;
	nextUrl: string;
	responses: IQuestionnaireResponse;
}

export const LookingForHome: FC<Props> = ({ assessmentId, previousUrl, nextUrl, responses }) => {
	const classes = usePICCobaltStyles();

	const { t } = useTranslation();
	const history = useHistory();

	const { mutate, isLoading: isSubmitting } = useSubmitResponse(assessmentId);

	const answer = getSingleAnswer(responses, LINK_ID);
	const value = answer?.valueString;

	const submitResponse = (newValue: string) => (event: React.MouseEvent) => {
		event.preventDefault();
		if (value === newValue) {
			history.push(nextUrl);
			return;
		}
		const response = stringQuestionnaireResponse(newValue, LINK_ID);
		mutate(response, {
			onSuccess: () => {
				history.push(nextUrl);
			},
		});
	};

	if (isSubmitting) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				<div className={'mx-auto mt-5'}>
					{t('lookingForDiagnosis.descriptionText')}
					<h3>{t('lookingForDiagnosis.subheaderText')}</h3>
				</div>
				<ToggleButtonGroup value={value} type="radio" name={LINK_ID} className={'mx-auto mb-1 d-flex flex-column justify-content-center'}>
					<ToggleButton
						value={'diagnosis'}
						variant="light"
						className={classes.centeredButton}
						data-cy={'diagnoses-button'}
						onClick={submitResponse('diagnosis')}
					>
						{t('lookingForDiagnosis.yesButtonText')}
					</ToggleButton>
					<ToggleButton
						value={'symptoms'}
						variant="light"
						className={classes.centeredButton}
						onClick={submitResponse('symptoms')}
						data-cy={'symptoms-button'}
					>
						{t('lookingForDiagnosis.noButtonText')}
					</ToggleButton>
				</ToggleButtonGroup>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previousUrl)}>
						{t('lookingForDiagnosis.backButtonText')}
					</Button>
					<Button onClick={() => history.push(nextUrl)} data-cy={'next-button'} disabled={value === undefined}>
						{t('listOfSymptoms.nextButtonText')}
					</Button>
				</div>
			</Col>
		</Container>
	);
};

interface DetailProps {
	assessmentId: string;
	previousUrl: string;
	nextUrl: string;
	responses: IQuestionnaireResponse;
}

export const LookingForDetail: FC<DetailProps> = ({ assessmentId, responses, nextUrl, previousUrl }) => {
	const detailPage = getSingleAnswer(responses, LINK_ID);
	const page = detailPage?.valueString;

	return page === 'diagnosis' ? (
		<LookingForDetailBody
			questionnaireURI="patientSelectedDiagnoses"
			description="listOfDiagnoses.descriptionText"
			options={diagnosesOptions}
			assessmentId={assessmentId}
			responses={responses}
			previousUrl={previousUrl}
			nextUrl={nextUrl}
		/>
	) : (
		<LookingForDetailBody
			questionnaireURI="patientSelectedSymptoms"
			description="listOfSymptoms.descriptionText"
			options={symptomsOptions}
			assessmentId={assessmentId}
			responses={responses}
			previousUrl={previousUrl}
			nextUrl={nextUrl}
		/>
	);
};

interface DetailBodyProps {
	questionnaireURI: string;
	assessmentId: string;
	previousUrl: string;
	nextUrl: string;
	description: string;
	options: Option[];
	responses: IQuestionnaireResponse;
}

const LookingForDetailBody: FC<DetailBodyProps> = ({ questionnaireURI, assessmentId, previousUrl, nextUrl, description, options, responses }) => {
	const { t } = useTranslation();
	const history = useHistory();

	const selectedItems = options
		.filter((o) => {
			const responseAnswer = getSingleAnswer(responses, o.key);
			return responseAnswer && (responseAnswer.valueBoolean === true || responseAnswer.valueString);
		})
		.map((o) => o.key);

	const otherKey = options.find((o) => o.key.split('/').includes('other'));
	const otherAnswer = otherKey && getSingleAnswer(responses, otherKey.key);
	const otherValue = otherAnswer ? otherAnswer.valueString || '' : '';

	const [selectedAttributes, setSelectedAttributes] = useState<string[]>(selectedItems);
	const [otherDescription, setOtherDescription] = useState<string>(otherValue);

	const { mutate, isLoading: isSubmitting } = useSubmitResponse(assessmentId);

	const onSubmit = (event: React.MouseEvent) => {
		event.preventDefault();
		const values = options.map((o) => ({ value: o.key, selected: selectedAttributes.includes(o.key) }));
		const questionnaireResponse = optionsToQuestionnaireResponse(values, questionnaireURI, otherDescription);
		mutate(questionnaireResponse, {
			onSuccess: () => {
				history.push(nextUrl);
			},
		});
	};

	if (isSubmitting) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				<div className={'mx-auto mt-5 mb-5'}>
					<h3>{t(description)}</h3>
					{t('listOfDiagnoses.subheaderText')}
				</div>
				<OptionsList
					options={options}
					updateSelected={setSelectedAttributes}
					updateOther={setOtherDescription}
					selectedOptions={selectedAttributes}
					otherValue={otherDescription}
				/>
				<Button onClick={() => history.push(nextUrl)} className={'d-flex mx-auto font-size-m'} variant="no-background">
					{t('listOfDiagnoses.skipButtonText')}
				</Button>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previousUrl)}>
						{t('lookingForDiagnosis.backButtonText')}
					</Button>
					<Button onClick={onSubmit} data-cy={'next-button'}>
						{t('listOfSymptoms.nextButtonText')}
					</Button>
				</div>
			</Col>
		</Container>
	);
};

interface Props {
	assessmentId: string;
	nextUrl: string;
	responses: IQuestionnaireResponse;
}
