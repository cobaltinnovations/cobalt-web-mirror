import React, { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { getFormattedPatientObject, CareType, FlagIdType } from '@/pages/pic/utils';
import AppointmentHome from '@/pages/pic/home/appointment-home';

import { useGetDisposition } from '@/hooks/pic-hooks';
import useAccount from '@/hooks/use-account';
import { useLocation } from 'react-router-dom';

import AssessmentHome from '@/pages/pic/home/assessment-home';
import MHICScheduleHome from '@/pages/pic/home/mhic-schedule-home';
import BHPScheduleHome from '@/pages/pic/home/bhp-schedule-home';
import ResourcesHome from '@/pages/pic/home/resources-home';

interface LocationState {
	finishedAssessment?: boolean;
}

const PICHome: FC = () => {
	const { picPatient } = useAccount();
	const { state } = useLocation<LocationState>();

	const { data: disposition, isLoading: isDispositionLoading } = useGetDisposition();

	const isLoading = isDispositionLoading;

	if (picPatient === undefined || isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	// Check to See if the assessment was just finished
	const finishedAssessment = !!state?.finishedAssessment;
	const patient = getFormattedPatientObject(picPatient);

	switch (disposition?.flag?.id) {
		case FlagIdType.OPTIONAL_REFERRAL:
		case FlagIdType.COORDINATE_REFERRAL:
		case FlagIdType.NEEDS_FURTHER_ASSESSMENT_WITH_MHIC:
		case FlagIdType.NEEDS_INITIAL_SAFETY_PLANNING:
		case FlagIdType.NEEDS_SAFETY_PLANNING_FOLLOW:
			return <MHICScheduleHome patient={patient} didJustFinish={finishedAssessment} careType={disposition?.outcome?.care?.id || CareType.SPECIALTY} />;
		case FlagIdType.SCHEDULE_WITH_PIC:
		case FlagIdType.AWAITING_PIC_SCHEDULING:
			return <BHPScheduleHome patient={patient} didJustFinish={finishedAssessment} careType={CareType.PIC} />;
		case FlagIdType.AWAITING_FIRST_PIC_APPOINTMENT:
		case FlagIdType.AWAITING_FIRST_EXTERNAL_APPOINTMENT:
			return <AppointmentHome patient={patient} />;
		case FlagIdType.GRADUATED:
			return <ResourcesHome patient={patient} />;
		case FlagIdType.NOT_YET_SCREENED:
		case FlagIdType.REMIND_ABOUT_DIGITAL_SCREENING:
		case FlagIdType.FINAL_OUTREACH_ATTEMPT:
		default:
			return <AssessmentHome patient={patient} />;
	}
};

export default PICHome;
