import React, { ReactElement } from 'react';
import SignUp from '@/pages/sign-up';
import SignUpVerify from '@/pages/sign-up-verify';
import SignIn from '@/pages/sign-in';
import SignInSSO from '@/pages/sign-in-sso';
import SignInEmail from '@/pages/sign-in-email';
import Auth from '@/pages/auth';
import Index from '@/pages';
import InTheStudio from '@/pages/in-the-studio';
import InTheStudioDetail from '@/pages/in-the-studio-detail';
import InTheStudioExternalDetail from '@/pages/in-the-studio-external-detail';
import InTheStudioGroupSessionScheduled from '@/pages/in-the-studio-group-session-scheduled';
import InTheStudioGroupSessionByRequest from '@/pages/in-the-studio-group-session-by-request';
import OnYourTime from '@/pages/on-your-time';
import SessionRequestThankYou from '@/pages/session-request-thank-you';
import OnYourTimeDetail from '@/pages/on-your-time-detail';
import Covid19Resources from '@/pages/covid-19-resources';
import WellBeingResources from '@/pages/well-being-resources';
import Privacy from '@/pages/privacy';
import WeeklyAssessment from '@/pages/weekly-assessment';
import IntakeAssessment from '@/pages/intake-assessment';
import OneOnOneResources from '@/pages/one-on-one-resources';
import ConnectWithSupport from '@/pages/connect-with-support';
import EhrLookup from '@/pages/ehr-lookup';
import MyCalendar from '@/pages/my-calendar';
import AppointmentDetails from '@/pages/appointment-details';
import Feedback from '@/pages/feedback';
import AccountSessionDetails from '@/pages/account-session-details';
import GroupSessionsScheduled from '@/pages/group-sessions-scheduled';
import GroupSessionsScheduledCreate from '@/pages/group-sessions-scheduled-create';
import GroupSessionsByRequest from '@/pages/group-sessions-by-request';
import GroupSessionsByRequestCreate from '@/pages/group-sessions-by-request-create';
import RedirectToBackend from '@/pages/redirect-to-backend';
import CmsOnYourTime from '@/pages/admin-cms/on-your-time';
import NoMatch from '@/pages/no-match';
import { Redirect, useRouteMatch } from 'react-router-dom';
import Header from '@/components/header';
import useQuery from '@/hooks/use-query';
import { queryParamDateRegex } from '@/lib/utils';
import moment from 'moment';
import CmsAvailableContent from '@/pages/admin-cms/available-content';
import CreateOnYourTimeContent from '@/pages/admin-cms/create-on-your-time-content';
import SignUpClaim from '@/pages/sign-up-claim';
import ForgotPassword from '@/pages/forgot-password';
import PasswordReset from '@/pages/password-reset';
import { OnYourTimeThanks } from '@/pages/on-your-time-thanks';
import { InTheStudioThanks } from '@/pages/in-the-studio-thanks';
import StatsDashboard from '@/pages/stats-dashboard';

import PatientSignIn from '@/pages/pic/patient-sign-in/patient-sign-in';
import PICHome from '@/pages/pic/home/home';
import AssessmentWrapper from '@/pages/pic/assessment/assessment-wrapper';
import { ContactLCSW } from '@/pages/pic/contact-lcsw/contact-lcsw';

import { DashboardWrapper } from '@/pages/pic/mhic-dashboard/dashboard-wrapper';
import PicProviderSearch from '@/pages/pic/provider-search';
import PicProviderCalendar from '@/pages/pic/provider-calendar';
import { isPicPatientAccount, isPicMhicAccount } from '@/pages/pic/utils';
import { Institution } from '@/lib/models/institution';
import { AccountModel } from '@/lib/models';

import config from '@/lib/config';
import {
	ProviderManagementBasics,
	ProviderManagementBluejeansConnection,
	ProviderManagementClinicalBackground,
	ProviderManagementCobaltBio,
	ProviderManagementCommunication,
	ProviderManagementPaymentTypesAccepted,
	ProviderManagementPersonalDetails,
	ProviderManagementProfile,
} from '@/pages/provider-management';

interface RouteGuardProps {
	subdomain?: string;
	account?: AccountModel;
	institution?: Institution;
}

export interface RouteConfig {
	path: string;
	exact: boolean;
	private: boolean;
	checkEnabled?: (guardProps: RouteGuardProps) => boolean;
	unauthRedirect?: string;
	header?: () => ReactElement;
	nav?: () => ReactElement;
	main: () => ReactElement;
}

const isInstitutionSupportEnabledRouteGuard = ({ institution }: RouteGuardProps): boolean => !!institution?.supportEnabled;

const isVanillaSubdomain = ({ subdomain }: RouteGuardProps): boolean => subdomain !== 'pic';

const isPicSubdomain = ({ subdomain }: RouteGuardProps): boolean => subdomain === 'pic';

const isPicPatientRouteGuard = ({ account }: RouteGuardProps) => !!account && isPicPatientAccount(account);

const isPicMhicRouteGuard = ({ account }: RouteGuardProps) => !!account && isPicMhicAccount(account);

const RedirectToSupport = () => {
	const match = useRouteMatch<{ supportRoleId: string }>();
	const query = useQuery();
	let routedSupportRoleId = match.params.supportRoleId ?? '';
	const routedStartDate = query.get('date') || '';
	const routedProviderId = query.get('providerId');
	const routedClinicIds = query.getAll('clinicId');

	if (routedSupportRoleId === 'therapist') {
		routedSupportRoleId = 'clinician';
	}

	const params = new URLSearchParams({
		supportRoleId: routedSupportRoleId.toUpperCase(),
		immediateAccess: 'true',
	});

	if (queryParamDateRegex.test(routedStartDate)) {
		const startDate = moment(routedStartDate);

		if (startDate.isValid()) {
			const endDate = startDate.clone().add(6, 'days');

			params.set('startDate', startDate.format('YYYY-MM-DD'));
			params.set('endDate', endDate.format('YYYY-MM-DD'));
		}
	}

	if (routedProviderId) {
		params.append('providerId', routedProviderId);
	}

	for (const clinicId of routedClinicIds) {
		params.append('clinicId', clinicId);
	}

	return <Redirect to={`/connect-with-support?${params.toString()}`} />;
};

export const Routes: RouteConfig[] = [
	{
		path: '/sign-up',
		exact: true,
		private: false,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <SignUp />,
	},
	{
		path: '/sign-up-verify',
		exact: true,
		private: false,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <SignUpVerify />,
	},
	{
		path: '/accounts/claim-invite/:accountInviteId',
		exact: true,
		private: false,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <SignUpClaim />,
	},
	{
		path: '/sign-in',
		exact: true,
		private: false,
		checkEnabled: isVanillaSubdomain,
		main: (): ReactElement => <SignIn />,
	},
	{
		path: '/sign-in-sso',
		exact: true,
		private: false,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <SignInSSO />,
	},
	{
		path: '/sign-in-email',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <SignInEmail />,
	},
	{
		path: '/forgot-password',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <ForgotPassword />,
	},
	{
		path: '/accounts/reset-password/:passwordResetToken',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: (): ReactElement => <PasswordReset />,
	},
	{
		path: '/auth',
		exact: true,
		private: false,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <Auth />,
	},
	{
		path: '/',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <Index />,
	},
	// {
	// 	path: '/intro-assessment',
	// 	exact: true,
	// 	private: true,
	// 	main: () => <IntroAssessment /,
	// },
	{
		path: '/in-the-studio',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudio />,
	},
	{
		path: '/in-the-studio-thanks',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudioThanks />,
	},
	{
		path: '/in-the-studio/:groupEventId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudioDetail />,
	},
	{
		path: '/in-the-studio/external/:externalGroupEventTypeId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudioExternalDetail />,
	},
	{
		path: '/in-the-studio/group-session-scheduled/:groupSessionId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudioGroupSessionScheduled />,
	},
	{
		path: '/in-the-studio/group-session-by-request/:groupSessionRequestId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <InTheStudioGroupSessionByRequest />,
	},
	{
		path: '/on-your-time',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <OnYourTime />,
	},
	{
		path: '/on-your-time-thanks',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <OnYourTimeThanks />,
	},
	{
		path: '/thank-you',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <SessionRequestThankYou />,
	},
	{
		path: '/on-your-time/:contentId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <OnYourTimeDetail />,
	},
	{
		path: '/covid-19-resources',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <Covid19Resources />,
	},
	{
		path: '/well-being-resources',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <WellBeingResources />,
	},
	{
		path: '/privacy',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <Privacy />,
	},
	{
		path: '/immediate-support/:supportRoleId',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <RedirectToSupport />,
	},
	{
		path: '/weekly-assessment',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isInstitutionSupportEnabledRouteGuard(guardProps) && isVanillaSubdomain(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <WeeklyAssessment />,
	},
	{
		path: '/intake-assessment',
		exact: true,
		private: true,
		checkEnabled: isInstitutionSupportEnabledRouteGuard,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <IntakeAssessment />,
	},
	{
		path: '/one-on-one-resources',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isInstitutionSupportEnabledRouteGuard(guardProps) && isVanillaSubdomain(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <OneOnOneResources />,
	},
	{
		path: '/connect-with-support',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isInstitutionSupportEnabledRouteGuard(guardProps) && isVanillaSubdomain(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <ConnectWithSupport />,
	},
	{
		path: '/ehr-lookup',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isInstitutionSupportEnabledRouteGuard(guardProps) && isVanillaSubdomain(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <EhrLookup />,
	},
	{
		path: '/my-calendar',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <MyCalendar />,
	},
	{
		path: '/appointments/:appointmentId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <AppointmentDetails />,
	},
	{
		path: '/feedback',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <Feedback />,
	},
	{
		path: '/account-sessions/:accountSessionId/text',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <AccountSessionDetails />,
	},
	{
		path: '/account-sessions/:accountSessionId/text',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <AccountSessionDetails />,
	},
	{
		path: '/group-sessions/scheduled',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsScheduled />,
	},
	{
		path: '/group-sessions/scheduled/create',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsScheduledCreate />,
	},
	{
		path: '/group-sessions/scheduled/:groupSessionId/edit',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsScheduledCreate />,
	},
	{
		path: '/group-sessions/by-request',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsByRequest />,
	},
	{
		path: '/group-sessions/by-request/create',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsByRequestCreate />,
	},
	{
		path: '/group-sessions/by-request/:groupSessionId/edit',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <GroupSessionsByRequestCreate />,
	},
	{
		path: '/group-session-reservations/:groupSessionReservationId/ical',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <RedirectToBackend />,
	},
	{
		path: '/group-session-reservations/:groupSessionReservationId/google-calendar',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <RedirectToBackend />,
	},
	{
		path: '/appointments/:appointmentId/ical',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <RedirectToBackend />,
	},
	{
		path: '/appointments/:appointmentId/google-calendar',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <RedirectToBackend />,
	},
	{
		path: '/cms/on-your-time',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <CmsOnYourTime />,
	},
	{
		path: '/cms/on-your-time/create',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <CreateOnYourTimeContent />,
	},
	{
		path: '/cms/available-content',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <CmsAvailableContent />,
	},
	{
		path: '/stats-dashboard',
		exact: true,
		private: true,
		checkEnabled: isVanillaSubdomain,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <StatsDashboard />,
	},
	{
		path: '/patient-sign-in',
		exact: true,
		private: false,
		checkEnabled: isPicSubdomain,
		main: (): ReactElement => <PatientSignIn />,
	},
	{
		path: '/pic/home',
		exact: true,
		private: true,
		unauthRedirect: '/patient-sign-in',
		checkEnabled: (guardProps: RouteGuardProps): boolean => isPicSubdomain(guardProps) && isPicPatientRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <PICHome />,
	},
	{
		path: '/pic/assessment',
		exact: false,
		private: true,
		unauthRedirect: '/patient-sign-in',
		checkEnabled: (guardProps: RouteGuardProps): boolean => {
			return (isPicSubdomain(guardProps) && isPicPatientRouteGuard(guardProps)) || isPicMhicRouteGuard(guardProps);
		},
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <AssessmentWrapper />,
	},
	{
		path: '/pic/mhic',
		exact: false,
		private: true,
		unauthRedirect: '/sign-in-email',
		checkEnabled: (guardProps: RouteGuardProps): boolean => isPicSubdomain(guardProps) && isPicMhicRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <DashboardWrapper />,
	},
	{
		path: '/pic/contact-lcsw',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isPicSubdomain(guardProps) && isPicPatientRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <ContactLCSW />,
	},
	{
		path: '/pic/provider-search',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps): boolean => isPicSubdomain(guardProps) && isPicPatientRouteGuard(guardProps),
		unauthRedirect: '/patient-sign-in',
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <PicProviderSearch />,
	},
	{
		path: '/pic/calendar',
		exact: true,
		private: true,
		unauthRedirect: '/sign-in-email',
		checkEnabled: (guardProps: RouteGuardProps): boolean => isPicSubdomain(guardProps) && isPicMhicRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <PicProviderCalendar />,
	},
	...(config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true'
		? [
				{
					path: `/providers/:providerId/profile`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementProfile />,
				},
				{
					path: `/providers/:providerId/basics`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementBasics />,
				},
				{
					path: `/providers/:providerId/clinical-background`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementClinicalBackground />,
				},
				{
					path: `/providers/:providerId/communication`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementCommunication />,
				},
				{
					path: `/providers/:providerId/bluejeans-connection`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementBluejeansConnection />,
				},
				{
					path: `/providers/:providerId/payment-types-accepted`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementPaymentTypesAccepted />,
				},
				{
					path: `/providers/:providerId/personal-details`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementPersonalDetails />,
				},
				{
					path: `/providers/:providerId/cobalt-bio`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: (): ReactElement => <ProviderManagementCobaltBio />,
				},
		  ]
		: []),
	{
		path: '*',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: (): ReactElement => <NoMatch />,
	},
];
