import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HomeWrapper from '@/pages/pic/home/home-wrapper';
import HomeMainHeader from '@/pages/pic/home/home-main-header';
import { FormattedPatientObject } from '@/pages/pic/utils';
import { useGetUpcomingAppointments, useGetRecentAppointments } from '@/hooks/pic-hooks';
import moment from 'moment';

import { ReactComponent as AppointmentScheduledImage } from '@/assets/pic/next_appt_scheduled.svg';

interface AppointmentProps {
	appointmentTime?: string;
	provider: string;
}

export const AppointmentScheduled: FC<AppointmentProps> = ({ appointmentTime, provider }) => {
	const { t } = useTranslation();
	return (
		<>
			<div className={'text-center mt-6'}>
				<h4 className={'font-weight-bold'}>{t('home.scheduledComponent.nextAppointmentHeader')}</h4>
				<p>
					{appointmentTime}
					<br />
					{provider}
				</p>
			</div>

			<Link className="text-decoration-none" to={'/my-calendar'}>
				<Button variant="primary" className={'mx-auto mt-5 d-flex justify-content-center'} size={'sm'} data-cy={'view-schedule-button'}>
					{t('home.scheduledComponent.viewCalendarButtonText')}
				</Button>
			</Link>
		</>
	);
};

interface Props {
	patient: FormattedPatientObject;
}

const AppointmentHome: FC<Props> = ({ patient }) => {
	const { t } = useTranslation();
	const { data: upcomingAppointments, isLoading: upcomingAppointmentsLoading } = useGetUpcomingAppointments();
	const { data: recentAppointments, isLoading: recentAppointmentsLoading } = useGetRecentAppointments();

	const isLoading = upcomingAppointmentsLoading || recentAppointmentsLoading;

	if (isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	const nextAppointment = upcomingAppointments && upcomingAppointments[0];

	const appointmentMissed = nextAppointment && moment(Date.now()).isAfter(moment(nextAppointment.startTime));

	// TODO: May need to do some logic here for other institution appointments.
	// 	const cobaltInstitutionId = upcomingAppointments[0].provider?.institutionId === 'COBALT';

	return (
		<HomeWrapper>
			<HomeMainHeader patientTenure="returning" name={patient.displayName} />
			<AppointmentScheduledImage className={'w-100 h-100'} />
			{nextAppointment && (
				<AppointmentScheduled appointmentTime={nextAppointment.startTimeDescription || ''} provider={nextAppointment.provider?.name || ''} />
			)}
			{nextAppointment && appointmentMissed && (
				<div className="mt-2">
					{t('home.extraPrompt.appointmentMissedAlert', {
						date: nextAppointment.startTimeDescription,
					})}
				</div>
			)}
		</HomeWrapper>
	);
};

export default AppointmentHome;
