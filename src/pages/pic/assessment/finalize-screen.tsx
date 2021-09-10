import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { useCompleteAssessment } from '@/hooks/pic-hooks';

interface FinalizeScreenProps {
	assessmentId: string;
	patientName: string;
	previousUrl: string;
	nextUrl: string;
}

export const FinalizeScreen: FC<FinalizeScreenProps> = ({ patientName, previousUrl, assessmentId, nextUrl }) => {
	const { t } = useTranslation();
	const history = useHistory();
	const { mutate: completeAssessment, isLoading: isSubmitting } = useCompleteAssessment();

	const doSubmit = () => {
		completeAssessment(assessmentId, {
			onSuccess: () => {
				history.push(nextUrl, { finishedAssessment: true });
			},
		});
	};

	if (isSubmitting) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				<p>{t(`finalizeScreen.headerText`, { name: patientName })}</p>
				<p>{t(`finalizeScreen.subheaderText`)}</p>
				<div className={'mx-auto mb-5 pt-3 d-flex justify-content-between'}>
					<Button variant="outline-primary" onClick={() => history.push(previousUrl)} data-cy={'intermediate-previous-button'}>
						Back
					</Button>
					<Button onClick={doSubmit} data-cy={'intermediate-next-button'}>
						Submit
					</Button>
				</div>
			</Col>
		</Container>
	);
};
