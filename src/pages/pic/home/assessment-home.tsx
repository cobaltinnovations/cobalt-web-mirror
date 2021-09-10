import React, { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { useGetAssessmentByPatientId, useGetUpcomingAppointments, useGetIsBusinessHours } from '@/hooks/pic-hooks';
import { FormattedPatientObject } from '@/pages/pic/utils';
import HomeWrapper from '@/pages/pic/home/home-wrapper';
import HomeMainHeader from '@/pages/pic/home/home-main-header';
import { HomeButtonLink } from '@/pages/pic/home/home-action-button';
import { ReactComponent as WelcomeIllustration } from '@/assets/pic/welcome.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

interface Props {
	patient: FormattedPatientObject;
}

const AssessmentHome: FC<Props> = ({ patient }) => {
	const { t } = useTranslation();

	const { data: isBusinessHours, isLoading: businessHoursLoading } = useGetIsBusinessHours();
	const { data: assessment, isLoading: assessmentLoading } = useGetAssessmentByPatientId(patient.picPatientId);
	const { data: upcomingAppointments, isLoading: upcomingAppointmentsLoading } = useGetUpcomingAppointments();

	const isLoading = assessmentLoading || businessHoursLoading || upcomingAppointmentsLoading;

	const patientType = assessment?.status === 'NOT_STARTED' ? 'newPatient' : 'returning';

	if (isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	if (!isBusinessHours) {
		return (
			<HomeWrapper>
				<HomeMainHeader patientTenure={patientType} name={patient.displayName} />
				<p className={'pt-4 pb-4'}>
					{t('home.body.assessmentClosedOffHours')}
					<Link className="px-1 py-0" to={'/pic/contact-lcsw'}>
						{t('home.body.crisisScreenLink')}
					</Link>
					{t('home.body.afterCrisisScreenLink')}
				</p>
			</HomeWrapper>
		);
	}

	const buttonText = assessment?.status === 'IN_PROGRESS' ? 'finishInitialAssessment' : 'startInitialAssessment';

	const dueDate = patient.referredToPic && moment(patient.referredToPic).add(7, 'days');
	const pastDue = moment().isAfter(dueDate);

	const nextAppointment = upcomingAppointments && upcomingAppointments[0];

	return (
		<HomeWrapper>
			<HomeMainHeader patientTenure={patientType} name={patient.displayName} />
			<WelcomeIllustration className={'w-100 h-100'} />
			<p className={'pt-4 pb-4'}>{t('home.body.firstStep', { pcp: patient.pcp })}</p>

			<div className={'mx-auto w-80 d-flex align-items-center justify-content-center mt-5'}>
				{dueDate && t('home.extraPrompt.assessmentDeadline', { dueDate: moment(dueDate).format('MM/DD') })}
				{pastDue && (
					<span className={'ml-1 text-secondary'}>({t('home.extraPrompt.assessmentOverdue', { days: moment().diff(dueDate, 'days') })})</span>
				)}
			</div>
			<HomeButtonLink icon={<EditIcon />} destination="/pic/assessment">
				{t(`home.actionButton.${buttonText}`)}
			</HomeButtonLink>
			<div className={'mx-auto w-80 d-flex align-items-center justify-content-center mt-5'}>
				{nextAppointment &&
					t('home.extraPrompt.completePreApptAssessment', {
						date: nextAppointment && moment(nextAppointment.startTime).format('MM/DD '),
					})}
				{nextAppointment && moment(nextAppointment.startTime).startOf('day').isSameOrBefore(Date.now()) && (
					<span>{t('home.extraPrompt.reassessmentComingDueAlert', { hours: moment(nextAppointment.startTime).fromNow() })}</span>
				)}
			</div>
		</HomeWrapper>
	);
};

export default AssessmentHome;
