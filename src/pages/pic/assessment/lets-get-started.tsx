import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container, Modal } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import usePICCobaltStyles from '@/pages/pic/picCobaltStyles';
import { ReactComponent as AssessmentToDo } from '@/assets/pic/assessment_to_do.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';

interface Props {
	nextUrl: string;
}

export const LetsGetStarted: FC<Props> = (props) => {
	const { t } = useTranslation();
	const classes = usePICCobaltStyles();
	const history = useHistory();
	const { nextUrl } = props;
	const [phoneModalVisible, setPhoneModalVisible] = useState(false);
	const phoneModalHandler = () => setPhoneModalVisible(!phoneModalVisible);

	return (
		<Container>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
				<AssessmentToDo className={'mt-5 mb-5 w-100 h-100'} />
				<h3>{t('letsGetStarted.header.firstTime')}</h3>
				<p>{t('letsGetStarted.body.firstTime')}</p>
				<Button
					className={'mx-auto mt-7 w-80 d-flex justify-content-center'}
					onClick={() => history.push(nextUrl)}
					data-cy={'start-assessment'}
				>
					{t('letsGetStarted.continueButtonText')}
				</Button>
				<p className={'mx-auto w-80 mt-4 text-center font-size-m'}>
					<div className={'text-primary mt-2 font-weight-bold'} onClick={phoneModalHandler}>
						<u className={classes.cursor}>{t('letsGetStarted.takePhoneScreeningText')}</u>
					</div>
				</p>
			</Col>
			<Modal show={phoneModalVisible} onHide={phoneModalHandler} centered>
				<Modal.Header closeButton className="border-bottom bg-light">
					<Modal.Title className={'font-weight-bold'}>{t('assessment.schedulePhoneAssessmentModal.title')}</Modal.Title>
					<p className="modal-title pt-2 mb-3">{t('assessment.schedulePhoneAssessmentModal.subTitle')}</p>
				</Modal.Header>
				<Modal.Body className="modal-body">
					<div className={'pb-4 border-bottom'}>
						{t('assessment.schedulePhoneAssessmentModal.optionOneLabel')}
						<br/>
						<br />
						<i className={'font-weight-italics'}>{t('assessment.schedulePhoneAssessmentModal.optionOneLabelSubtext')}</i>
						<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:215-555-1212">
							<PhoneIcon className={'float-left position-relative mr-2 my-2'} />
							<div className={'d-flex flex-column font-size-s ml-2'}>
								<span className={'text-primary mb-2'}>{t('assessment.schedulePhoneAssessmentModal.optionOneButtonText')}</span>
								<span className={'font-weight-regular'}>{t('assessment.schedulePhoneAssessmentModal.optionOneButtonSecondaryText')}</span>
							</div>
						</Button>
					</div>
					<div className={'py-4'}>
						{t('assessment.schedulePhoneAssessmentModal.optionTwoLabel')}
						{/*TODO: this button needs to connect to calendar to schedule a screening */}
						<Button variant="grey" className={'w-100 d-flex mt-2 align-items-center'}>
							<CalendarIcon className={'mr-4'} />
							<div className={'font-size-s text-primary'}>{t('assessment.schedulePhoneAssessmentModal.optionTwoButtonText')}</div>
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</Container>
	);
};
