import React, { FC, useState } from 'react';
import { Button, Col, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GoalsMultiSelect } from '@/pages/pic/assessment/goals-multi-select';
import { GoalsStackRank } from '@/pages/pic/assessment/goals-stack-rank';
import { IntermediateScreen } from '@/pages/pic/assessment/interstitial-screen';
import { goals, treatmentOptions } from '@/assets/pic/formTemplates/goalsTemplates';
import { R4 } from '@ahryman40k/ts-fhir-types';
import axios from 'axios';
import config from '@/lib/config';
import { useMutation } from 'react-query';
import { arrayToQuestionnaireResponse } from '@/pages/pic/assessment/assessment-utils';
import { postQuestionnaireResponse } from '@/hooks/pic-hooks';

export const SetGoals: FC<Props> = (props) => {
	const { t } = useTranslation();
	const { setNextComponent, assessmentId, patientName } = props;
	const [currentScreen, setCurrentScreen] = useState(0);
	const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [otherCodeDescription, setOtherDescription] = useState<string>('');

	const goalScreens = ['interstitial', 'hopeToSeeOrFeel', 'rankOrderOfImportance', 'openToOptions'];

	const postQuestionnaire = async (questionnaireResponse: R4.IQuestionnaireResponse) => {
		const data = await postQuestionnaireResponse(assessmentId, questionnaireResponse);
		data && setNextComponent('finished');
	};

	const { mutate } = useMutation(postQuestionnaire);

	const submitGoals = () => {
		const questionnaireURI = 'patientGoals';
		const questionnaireResponse = arrayToQuestionnaireResponse([...selectedGoals, ...selectedOptions], questionnaireURI, otherCodeDescription);
		mutate(questionnaireResponse);
	};

	const backButtonClickHandler = () => setCurrentScreen(currentScreen - 1);
	const nextButtonClickHandler = () => (currentScreen < goalScreens.length - 1 ? setCurrentScreen(currentScreen + 1) : submitGoals());

	return (
		<>
			{goalScreens[currentScreen] === 'interstitial' ? (
				{
					/* <IntermediateScreen screenId={'goals'} callback={() => setCurrentScreen(currentScreen + 1)} patientName={patientName} /> */
				}
			) : (
				<Container>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 12, offset: 1 }}>
						<h3 className={'mx-auto mt-5'}>{t(`goalSetting.${goalScreens[currentScreen]}.header`)}</h3>
						{t(`goalSetting.${goalScreens[currentScreen]}.instructions`)}
						{goalScreens[currentScreen] === 'hopeToSeeOrFeel' && (
							<>
								<GoalsMultiSelect options={goals} updateSelected={setSelectedGoals} updateOther={setOtherDescription} />
								<p className={'mx-auto w-80 mt-5 text-center font-size-m'}>
									<Button variant="no-background" onClick={() => setNextComponent('finished')}>
										{t('goalSetting.skipButtonText')}
									</Button>
								</p>
							</>
						)}
						{goalScreens[currentScreen] === 'rankOrderOfImportance' && (
							<GoalsStackRank selectedGoals={selectedGoals} setSelectedGoals={setSelectedGoals} />
						)}
						{goalScreens[currentScreen] === 'openToOptions' && <GoalsMultiSelect options={treatmentOptions} updateSelected={setSelectedOptions} />}
						<div className={'w-80 mb-10 mx-auto d-flex justify-content-between'}>
							<Button onClick={backButtonClickHandler} variant="outline-primary">
								{t('goalSetting.backButtonText')}
							</Button>
							<Button onClick={nextButtonClickHandler} data-cy={'next-button'}>
								{t('goalSetting.nextButtonText')}
							</Button>
						</div>
					</Col>
				</Container>
			)}
		</>
	);
};

interface Props {
	setNextComponent(text: string): void;
	patientName: string;
	assessmentId: string;
}
