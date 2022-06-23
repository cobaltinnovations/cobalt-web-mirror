import moment from 'moment';
import React, { ReactElement } from 'react';
import { Redirect, useRouteMatch } from 'react-router-dom';
import config from '@/lib/config';
import { queryParamDateRegex } from '@/lib/utils';
import { Institution } from '@/lib/models/institution';
import { AccountModel } from '@/lib/models';
import useQuery from '@/hooks/use-query';
import Header from '@/components/header';
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

const Onboarding = React.lazy(() => import('@/pages/onboarding'));
const SignUp = React.lazy(() => import('@/pages/sign-up'));
const SignUpVerify = React.lazy(() => import('@/pages/sign-up-verify'));
const SignIn = React.lazy(() => import('@/pages/sign-in'));
const SignInSSO = React.lazy(() => import('@/pages/sign-in-sso'));
const SignInEmail = React.lazy(() => import('@/pages/sign-in-email'));
const Auth = React.lazy(() => import('@/pages/auth'));
const Index = React.lazy(() => import('@/pages'));
const InTheStudio = React.lazy(() => import('@/pages/in-the-studio'));
const InTheStudioDetail = React.lazy(() => import('@/pages/in-the-studio-detail'));
const InTheStudioExternalDetail = React.lazy(() => import('@/pages/in-the-studio-external-detail'));
const InTheStudioGroupSessionScheduled = React.lazy(() => import('@/pages/in-the-studio-group-session-scheduled'));
const InTheStudioGroupSessionByRequest = React.lazy(() => import('@/pages/in-the-studio-group-session-by-request'));
const OnYourTime = React.lazy(() => import('@/pages/on-your-time'));
const SessionRequestThankYou = React.lazy(() => import('@/pages/session-request-thank-you'));
const OnYourTimeDetail = React.lazy(() => import('@/pages/on-your-time-detail'));
const Covid19Resources = React.lazy(() => import('@/pages/covid-19-resources'));
const WellBeingResources = React.lazy(() => import('@/pages/well-being-resources'));
const Privacy = React.lazy(() => import('@/pages/privacy'));
const WeeklyAssessment = React.lazy(() => import('@/pages/weekly-assessment'));
const IntakeAssessment = React.lazy(() => import('@/pages/intake-assessment'));
const OneOnOneResources = React.lazy(() => import('@/pages/one-on-one-resources'));
const ConnectWithSupport = React.lazy(() => import('@/pages/connect-with-support'));
const EhrLookup = React.lazy(() => import('@/pages/ehr-lookup'));
const MyCalendar = React.lazy(() => import('@/pages/my-calendar'));
const AppointmentDetails = React.lazy(() => import('@/pages/appointment-details'));
const Feedback = React.lazy(() => import('@/pages/feedback'));
const AccountSessionDetails = React.lazy(() => import('@/pages/account-session-details'));
const GroupSessionsScheduled = React.lazy(() => import('@/pages/group-sessions-scheduled'));
const GroupSessionsScheduledCreate = React.lazy(() => import('@/pages/group-sessions-scheduled-create'));
const GroupSessionsByRequest = React.lazy(() => import('@/pages/group-sessions-by-request'));
const GroupSessionsByRequestCreate = React.lazy(() => import('@/pages/group-sessions-by-request-create'));
const RedirectToBackend = React.lazy(() => import('@/pages/redirect-to-backend'));
const CmsOnYourTime = React.lazy(() => import('@/pages/admin-cms/on-your-time'));
const OnYourTimeThanks = React.lazy(() => import('@/pages/on-your-time-thanks'));
const InTheStudioThanks = React.lazy(() => import('@/pages/in-the-studio-thanks'));
const ProviderDetail = React.lazy(() => import('@/pages/provider-detail'));
const NoMatch = React.lazy(() => import('@/pages/no-match'));
const CmsAvailableContent = React.lazy(() => import('@/pages/admin-cms/available-content'));
const CreateOnYourTimeContent = React.lazy(() => import('@/pages/admin-cms/create-on-your-time-content'));
const SignUpClaim = React.lazy(() => import('@/pages/sign-up-claim'));
const ForgotPassword = React.lazy(() => import('@/pages/forgot-password'));
const PasswordReset = React.lazy(() => import('@/pages/password-reset'));
const StatsDashboard = React.lazy(() => import('@/pages/stats-dashboard'));
const MySchedule = React.lazy(() => import('@/pages/scheduling/my-schedule'));
const Interaction = React.lazy(() => import('@/pages/interaction'));
const InteractionInstances = React.lazy(() => import('@/pages/interaction-instances'));

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

const isInstitutionSupportEnabledRouteGuard = ({ institution }: RouteGuardProps): boolean =>
	!!institution?.supportEnabled;
const isProviderRouteGuard = ({ account }: RouteGuardProps) => !!account && account.roleId === 'PROVIDER';

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

export const Routes = [
	{
		path: '/onboarding',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: Onboarding,
	},
	{
		path: '/sign-up',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: SignUp,
	},
	{
		path: '/sign-up-verify',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: SignUpVerify,
	},
	{
		path: '/accounts/claim-invite/:accountInviteId',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: SignUpClaim,
	},
	{
		path: '/sign-in',
		exact: true,
		private: false,
		main: SignIn,
	},
	{
		path: '/sign-in-sso',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: SignInSSO,
	},
	{
		path: '/sign-in-email',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: SignInEmail,
	},
	{
		path: '/forgot-password',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: ForgotPassword,
	},
	{
		path: '/accounts/reset-password/:passwordResetToken',
		exact: true,
		private: false,
		header: (): ReactElement => <Header showHeaderButtons={false} />,
		main: PasswordReset,
	},
	{
		path: '/auth',
		exact: true,
		private: false,
		header: (): ReactElement => <Header />,
		main: Auth,
	},
	{
		path: '/',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: Index,
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
		header: (): ReactElement => <Header />,
		main: InTheStudio,
	},
	{
		path: '/in-the-studio-thanks',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InTheStudioThanks,
	},
	{
		path: '/in-the-studio/:groupEventId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InTheStudioDetail,
	},
	{
		path: '/in-the-studio/external/:externalGroupEventTypeId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InTheStudioExternalDetail,
	},
	{
		path: '/in-the-studio/group-session-scheduled/:groupSessionId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InTheStudioGroupSessionScheduled,
	},
	{
		path: '/in-the-studio/group-session-by-request/:groupSessionRequestId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InTheStudioGroupSessionByRequest,
	},
	{
		path: '/on-your-time',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: OnYourTime,
	},
	{
		path: '/on-your-time-thanks',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: OnYourTimeThanks,
	},
	{
		path: '/thank-you',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: SessionRequestThankYou,
	},
	{
		path: '/on-your-time/:contentId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: OnYourTimeDetail,
	},
	{
		path: '/covid-19-resources',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: Covid19Resources,
	},
	{
		path: '/well-being-resources',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: WellBeingResources,
	},
	{
		path: '/privacy',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: Privacy,
	},
	{
		path: '/immediate-support/:supportRoleId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: RedirectToSupport,
	},
	{
		path: '/weekly-assessment',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps) =>
			isInstitutionSupportEnabledRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: WeeklyAssessment,
	},
	{
		path: '/intake-assessment',
		exact: true,
		private: true,
		checkEnabled: isInstitutionSupportEnabledRouteGuard,
		header: (): ReactElement => <Header />,
		main: IntakeAssessment,
	},
	{
		path: '/one-on-one-resources',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps) =>
			isInstitutionSupportEnabledRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: OneOnOneResources,
	},
	{
		path: '/connect-with-support',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps) =>
			isInstitutionSupportEnabledRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: ConnectWithSupport,
	},
	{
		path: '/ehr-lookup',
		exact: true,
		private: true,
		checkEnabled: (guardProps: RouteGuardProps) =>
			isInstitutionSupportEnabledRouteGuard(guardProps),
		header: (): ReactElement => <Header />,
		main: EhrLookup,
	},
	{
		path: '/my-calendar',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: MyCalendar,
	},
	{
		path: '/scheduling',
		private: true,
		checkEnabled: isProviderRouteGuard,
		header: (): ReactElement => <Header />,
		main: MySchedule,
	},
	{
		path: '/appointments/:appointmentId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: AppointmentDetails,
	},
	{
		path: '/feedback',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: Feedback,
	},
	{
		path: '/account-sessions/:accountSessionId/text',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: AccountSessionDetails,
	},
	{
		path: '/account-sessions/:accountSessionId/text',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: AccountSessionDetails,
	},
	{
		path: '/group-sessions/scheduled',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsScheduled,
	},
	{
		path: '/group-sessions/scheduled/create',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsScheduledCreate,
	},
	{
		path: '/group-sessions/scheduled/:groupSessionId/edit',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsScheduledCreate,
	},
	{
		path: '/group-sessions/scheduled/:groupSessionId/view',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsScheduledCreate,
	},
	{
		path: '/group-sessions/by-request',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsByRequest,
	},
	{
		path: '/group-sessions/by-request/create',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsByRequestCreate,
	},
	{
		path: '/group-sessions/by-request/:groupSessionId/edit',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: GroupSessionsByRequestCreate,
	},
	{
		path: '/group-session-reservations/:groupSessionReservationId/ical',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: RedirectToBackend,
	},
	{
		path: '/group-session-reservations/:groupSessionReservationId/google-calendar',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: RedirectToBackend,
	},
	{
		path: '/appointments/:appointmentId/ical',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: RedirectToBackend,
	},
	{
		path: '/appointments/:appointmentId/google-calendar',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: RedirectToBackend,
	},
	{
		path: '/cms/on-your-time',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: CmsOnYourTime,
	},
	{
		path: '/cms/on-your-time/create',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: CreateOnYourTimeContent,
	},
	{
		path: '/cms/available-content',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: CmsAvailableContent,
	},
	{
		path: '/stats-dashboard',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: StatsDashboard,
	},
	{
		path: '/providers/:providerId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: ProviderDetail,
	},
	...(config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true'
		? [
				{
					path: `/providers/:providerId/profile`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementProfile,
				},
				{
					path: `/providers/:providerId/basics`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementBasics,
				},
				{
					path: `/providers/:providerId/clinical-background`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementClinicalBackground,
				},
				{
					path: `/providers/:providerId/communication`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementCommunication,
				},
				{
					path: `/providers/:providerId/bluejeans-connection`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementBluejeansConnection,
				},
				{
					path: `/providers/:providerId/payment-types-accepted`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementPaymentTypesAccepted,
				},
				{
					path: `/providers/:providerId/personal-details`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementPersonalDetails,
				},
				{
					path: `/providers/:providerId/cobalt-bio`,
					exact: true,
					private: true,
					header: (): ReactElement => <Header />,
					main: ProviderManagementCobaltBio,
				},
		  ]
		: []),
	{
		path: '/interaction/:interactionInstanceId/option/:interactionOptionId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: Interaction,
	},
	{
		path: '/interaction-instances/:interactionId',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: InteractionInstances,
	},
	{
		path: '*',
		exact: true,
		private: true,
		header: (): ReactElement => <Header />,
		main: NoMatch,
	},
];
