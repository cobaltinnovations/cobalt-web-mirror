import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container, ToggleButtonGroup, ToggleButton, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { stringQuestionnaireResponse, getSingleAnswer } from '@/pages/pic/assessment/assessment-utils';
import { useSubmitResponse } from '@/hooks/pic-hooks';
import { IQuestionnaireResponse } from '@ahryman40k/ts-fhir-types/lib/R4';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';

const LINK_ID = '/pic-military';

interface Props {
	assessmentId: string;
	previousUrl: string;
	nextUrl: string;
	responses: IQuestionnaireResponse;
}

export const MilitaryNationalGuard: FC<Props> = ({ assessmentId, previousUrl, nextUrl, responses }) => {
	const classes = usePICCobaltStyles();

	const history = useHistory();

	const { t } = useTranslation();

	const { mutate, isLoading: isSubmitting } = useSubmitResponse(assessmentId);

	const answer = getSingleAnswer(responses, LINK_ID);
	const value = answer?.valueString;

	const submitResponse = (option: string) => (event: React.MouseEvent) => {
		event.preventDefault();
		if (value === option) {
			history.push(nextUrl);
			return;
		}
		const response = stringQuestionnaireResponse(option, LINK_ID);
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
				<div className="d-flex text-center mt-5 mb-5 px-5">
					<h3>{t('militaryNationalGuard.initialQuestion')}</h3>
				</div>
				<ToggleButtonGroup value={value} type="radio" name={LINK_ID} className={'mx-auto mb-1 d-flex flex-column justify-content-center'}>
					<ToggleButton value={'pre911'} variant="light" className={classes.centeredButton} onClick={submitResponse('pre911')}>
						{t('militaryNationalGuard.pre911Text')}
					</ToggleButton>
					<ToggleButton value={'post911'} variant="light" className={classes.centeredButton} onClick={submitResponse('post911')}>
						{t('militaryNationalGuard.post911Text')}
					</ToggleButton>
					<ToggleButton value={'no'} variant="light" className={classes.centeredButton} onClick={submitResponse('no')}>
						{t('militaryNationalGuard.noButtonText')}
					</ToggleButton>
				</ToggleButtonGroup>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previousUrl)}>
						Back
					</Button>
					<Button onClick={() => history.push(nextUrl)} disabled={value === undefined}>
						Next
					</Button>
				</div>
			</Col>
		</Container>
	);
};
