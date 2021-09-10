import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container } from 'react-bootstrap';
import { ReactComponent as Safety } from '@/assets/pic/safety.svg';
import { ReactComponent as FeelingRecently } from '@/assets/pic/feeling_recently.svg';
import { ReactComponent as KeepGoing } from '@/assets/pic/keep_going.svg';
import { ReactComponent as Goals } from '@/assets/pic/goals.svg';
import { useHistory } from 'react-router';

interface IntermediateScreenProps {
	screenId: string;
	patientName: string;
	nextUrl: string;
	previousUrl: string;
}

export const IntermediateScreen: FC<IntermediateScreenProps> = ({ screenId, patientName, nextUrl, previousUrl }) => {
	const { t } = useTranslation();
	const history = useHistory();

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				{screenId === 'preCssrs' && <Safety className={'w-100 h-100 mt-5 mb-5'} />}
				{screenId === 'preGad7' && <FeelingRecently className={'w-100 h-100 mt-5 mb-5'} />}
				{screenId === 'letsKeepGoing' && <KeepGoing className={'w-100 h-100 mt-5 mb-5'} />}
				{screenId === 'goals' && <Goals className={'w-100 h-100 mt-5 mb-5'} />}
				<p>{t(`interstitialScreen.headerText.${screenId}`, { name: patientName })}</p>
				<p>{t(`interstitialScreen.subheaderText.${screenId}`)}</p>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previousUrl)} data-cy={'intermediate-previous-button'}>
						Back
					</Button>
					<Button onClick={() => history.push(nextUrl)} data-cy={'intermediate-next-button'}>
						Next
					</Button>
				</div>
			</Col>
		</Container>
	);
};
