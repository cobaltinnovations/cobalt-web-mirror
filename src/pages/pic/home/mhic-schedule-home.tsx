import React, { FC } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CareType, FormattedPatientObject } from '@/pages/pic/utils';
import HomeWrapper from '@/pages/pic/home/home-wrapper';
import HomeMainHeader from '@/pages/pic/home/home-main-header';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { ReactComponent as ConnectingToCare } from '@/assets/pic/connecting_to_care.svg';
import { ReactComponent as AppointmentImage } from '@/assets/pic/appointment.svg';
import { useGetUpcomingAppointments } from '@/hooks/pic-hooks';
import AppointmentHome from '@/pages/pic/home/appointment-home';

interface Props {
	patient: FormattedPatientObject;
	careType: CareType;
	didJustFinish: boolean;
}

const BHPScheduleHome: FC<Props> = ({ patient, didJustFinish, careType }) => {
	const { t } = useTranslation();
	// We should be doing this logic off the flag, but right now we're not processing it, so we need to check the appointments

	const { data: upcomingAppointments, isLoading: upcomingAppointmentsLoading } = useGetUpcomingAppointments();

	if (upcomingAppointmentsLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	if (upcomingAppointments && upcomingAppointments.length > 0) {
		return <AppointmentHome patient={patient} />;
	}

	const bodyContent = careType === CareType.SUB_CLINICAL ? t('home.body.optionalReferral') : t('home.body.didNotActReferredOutNoGoals');
	const image = careType === CareType.SUB_CLINICAL ? <AppointmentImage className={'w-100 h-100'} /> : <ConnectingToCare className={'w-100 h-100'} />;

	return (
		<HomeWrapper>
			<HomeMainHeader patientTenure="returning" name={patient.displayName} />
			{image}
			<h3 className={'pt-4 pb-4'}>{t(`home.label.recommendedNextStep`)}</h3>
			<p>{bodyContent}</p>
			<div className="border-bottom">
				<div className="modal-body">
					<div className={'pb-4 border-bottom'}>
						{t('assessment.schedulePhoneAssessmentModal.optionOneLabel')}
						<br />
						<br />
						<i className={'font-weight-italics'}>{t('assessment.schedulePhoneAssessmentModal.optionOneLabelSubtext')}</i>
						<Button variant="light" className={'w-100 d-flex mt-2'} href="tel:215-555-1212">
							<PhoneIcon className={'float-left position-relative mr-2 my-2'} />
							<div className={'d-flex flex-column font-size-s ml-2'}>
								<span className={'text-primary mb-2'}>{t('assessment.schedulePhoneAssessmentModal.optionOneButtonText')}</span>
								<span className={'font-weight-regular'}>{t('assessment.schedulePhoneAssessmentModal.optionOneButtonSecondaryText')}</span>
							</div>
						</Button>
					</div>
					<div className={'py-4'}>
						{t('assessment.schedulePhoneAssessmentModal.optionTwoLabel')}
						<Link className="text-decoration-none" to={'/pic/provider-search?supportRoleId=MHIC'}>
							<Button variant="light" className={'w-100 d-flex mt-2 align-items-center'} data-cy={'take-screening'}>
								<CalendarIcon className={'mr-2'} />
								Please call me
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</HomeWrapper>
	);
};

export default BHPScheduleHome;
