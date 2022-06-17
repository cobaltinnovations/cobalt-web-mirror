import React, { FC } from 'react';
import { ToggleButtonGroup, ToggleButton, Button, Col, Container, Spinner } from 'react-bootstrap';
import { R4 } from '@ahryman40k/ts-fhir-types';
import {
	IQuestionnaire_Item,
	IQuestionnaireResponse,
	QuestionnaireResponseStatusKind,
} from '@ahryman40k/ts-fhir-types/lib/R4';
import { IntermediateScreen } from '@/pages/pic/assessment/interstitial-screen';
import { FinalizeScreen } from '@/pages/pic/assessment/finalize-screen';
import { useSubmitResponse, useAssessmentQuestionnaire } from '@/hooks/pic-hooks';
import { useTranslation } from 'react-i18next';
import { useParams, Redirect, useRouteMatch, useHistory, generatePath } from 'react-router';
import { getSingleAnswer } from '@/pages/pic/assessment/assessment-utils';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';
import { useQueryClient } from 'react-query';

interface Props {
	patientName: string;
	assessmentId: string;
	previousUrl: string;
	responses: IQuestionnaireResponse;
	finishedUrl: string;
}

interface ParamTypes {
	page: string;
}

export const AssessmentForm: FC<Props> = ({ assessmentId, responses, previousUrl, patientName, finishedUrl }) => {
	const { isLoading, data: questionnaire } = useAssessmentQuestionnaire(assessmentId);
	const { page, ...otherParams } = useParams<ParamTypes>();
	const { path } = useRouteMatch();

	// We want this to spin if the questionnaire is refreshing
	if (isLoading || !questionnaire) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	const pageNumber = +page;

	if (!questionnaire.item) {
		console.error('Bad questionnaire');
		return null;
	}

	const currentPage = questionnaire.item[pageNumber];

	const firstPage = pageNumber === 0;
	const previousPage = questionnaire.item[pageNumber - 1];

	const previous = firstPage
		? previousUrl
		: previousPage.type === 'group' && previousPage.item
		? generatePath(`${path}/:item`, {
				// @ts-ignore
				page: pageNumber - 1,
				item: previousPage.item.length - 1,
				...otherParams,
		  })
		: generatePath(`${path}`, {
				page: pageNumber - 1,
				...otherParams,
		  });

	const next = generatePath(`${path}`, {
		page: pageNumber + 1,
		...otherParams,
	});

	if (!currentPage) {
		return (
			<FinalizeScreen
				assessmentId={assessmentId}
				previousUrl={previous}
				patientName={patientName}
				nextUrl={finishedUrl}
			/>
		);
	} else if (currentPage.type === 'group') {
		return (
			<AssessmentFormItem
				responses={responses}
				previousUrl={previous}
				nextUrl={next}
				assessmentId={assessmentId}
				item={currentPage}
			/>
		);
	} else if (currentPage.type === 'display' && currentPage.linkId) {
		return (
			<IntermediateScreen
				screenId={currentPage.linkId}
				previousUrl={previous}
				nextUrl={next}
				patientName={patientName}
			/>
		);
	}
	return <p>Page {page}</p>;
};

interface AssessmentItemProps {
	responses: IQuestionnaireResponse;
	assessmentId: string;
	item: IQuestionnaire_Item;
	previousUrl: string;
	nextUrl: string;
}

interface QuestionParamTypes {
	item: string;
	page: string;
}

const AssessmentFormItem: FC<AssessmentItemProps> = ({ responses, assessmentId, item, previousUrl, nextUrl }) => {
	const { path, url } = useRouteMatch();
	const questionMatch = useRouteMatch<QuestionParamTypes>(`${path}/:item`);
	const history = useHistory();
	const queryClient = useQueryClient();

	const { t } = useTranslation();

	const { mutate: submitResponse, isLoading: isSubmitting } = useSubmitResponse(assessmentId);

	const classes = usePICCobaltStyles();

	if (!questionMatch) {
		return <Redirect to={`${url}/0`} />;
	}

	const questionIndex = questionMatch ? +questionMatch.params.item : 0;
	if (!item.item) {
		return null;
	}
	const question = item.item[questionIndex];

	if (!question.linkId) {
		return null;
	}

	const next = questionIndex < item.item.length - 1 ? `${url}/${questionIndex + 1}` : nextUrl;
	const previous = questionIndex === 0 ? previousUrl : `${url}/${questionIndex - 1}`;

	const submitAnswer =
		(question: IQuestionnaire_Item, answer: string, previousAnswer: string) => (event: React.MouseEvent) => {
			event.preventDefault();
			if (answer === previousAnswer) {
				history.push(next);
			}
			const selectedItem = question.answerOption?.find((a) => a.valueCoding?.code === answer);
			if (!selectedItem) {
				return;
			}
			const answers = [
				{
					linkId: question.linkId,
					answer: [
						{
							valueCoding: {
								system: selectedItem.valueCoding?.system,
								code: selectedItem.valueCoding?.code,
								display: selectedItem.valueCoding?.display,
								userSelected: true,
							},
						},
					],
				},
			];

			const response: IQuestionnaireResponse = {
				resourceType: 'QuestionnaireResponse',
				questionnaire: question.linkId,
				status: QuestionnaireResponseStatusKind._inProgress,
				item: answers,
			};

			submitResponse(response, {
				onSuccess: async () => {
					const newQuestionnaire = queryClient.getQueryData<R4.IQuestionnaire>([
						'assessment',
						assessmentId,
						'questionnaire',
					]);
					const myPageNumber = +questionMatch.params.page;
					if (newQuestionnaire && newQuestionnaire.item) {
						const myPage = newQuestionnaire.item[myPageNumber];
						const moreItemsOnCurrentPage = questionIndex < (myPage.item?.length || 0) - 1;
						if (moreItemsOnCurrentPage) {
							history.push(`${url}/${questionIndex + 1}`);
							return;
						}
					}
					history.push(next);
				},
			});
		};

	// display helper list for pre-ptsd
	const isPrePtsd = item.linkId === '/pic-pre-ptsd';
	// display helper list for ASRM
	const isAsrm = item.linkId === '/pic-ASRM';
	// hide header on last question of PHQ9
	const lastPhq9Q = item.linkId === '/44249-1' && questionIndex === 9;
	// display different header for first 4 questions of BPI
	const isBpi = item.linkId === '/77564-3';
	const alternativeBpiHeader = 'On a scale from 0-10, where 0 is no pain and 10 is pain as bad as you can imagine';
	// single Q drug & alcohol privacy reminder
	const isSingleQAlcohol = item.linkId === '/pic-simple-drug-alcohol';

	const answer = getSingleAnswer(responses, question.linkId);
	const value = answer?.valueCoding?.code || '';

	if (isSubmitting) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				{!lastPhq9Q && (
					<h4
						className={'font-weight-regular mx-auto mt-5'}
						dangerouslySetInnerHTML={{
							__html: isBpi && questionIndex < 4 ? alternativeBpiHeader : item.text || '',
						}}
					/>
				)}
				{isSingleQAlcohol && (
					<h5 className={'font-weight-regular mx-auto mt-3'}>
						{t('assessment.additionalPrompts.drugQPrivacyStatement')}
					</h5>
				)}
				{isPrePtsd && (
					<ul className={'mx-auto mt-5'}>
						<li>a serious accident or fire</li>
						<li>a physical or sexual assault or abuse</li>
						<li>an earthquake or flood</li>
						<li>a war</li>
						<li>seeing someone be killed or seriously injured</li>
						<li>having a loved one die through homicide or suicide</li>
					</ul>
				)}
				<div className={'mx-auto mt-5'}>
					<h3 className={'mb-5'} dangerouslySetInnerHTML={{ __html: question.text || '' }} />
				</div>
				{isAsrm && (
					<ul className={'mx-auto mb-5'}>
						<li>“occasionally” means once or twice</li>
						<li>“often” means several times or more</li>
						<li>“frequently” means most of the time</li>
					</ul>
				)}
				<ToggleButtonGroup
					type="radio"
					name={question.linkId}
					className={'mx-auto mb-1 d-flex flex-column justify-content-center'}
					value={value}
				>
					{question.answerOption?.map((answer: R4.IQuestionnaire_AnswerOption, answerIndex) => {
						if (!answer.valueCoding || !answer.valueCoding.display || !answer.valueCoding.code) {
							console.error('Bad Items');
							return null;
						}
						const { display, code } = answer.valueCoding;
						return (
							<ToggleButton
								key={`${question.linkId}${code}`}
								type="radio"
								value={code}
								className={classes.centeredButton}
								checked={code === value}
								variant="light"
								onClick={submitAnswer(question, code, value)}
							>
								{display}
							</ToggleButton>
						);
					})}
				</ToggleButtonGroup>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previous)}>
						Back
					</Button>
					<Button onClick={() => history.push(next)} disabled={value === ''}>
						Next
					</Button>
				</div>
			</Col>
		</Container>
	);
};
