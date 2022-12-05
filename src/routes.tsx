import React, { useEffect } from 'react';
import { Outlet, Navigate, useMatch, useSearchParams, useNavigate } from 'react-router-dom';

import config from '@/lib/config';
import { Institution } from '@/lib/models/institution';
import { AccountModel } from '@/lib/models';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HeaderUnauthenticated from '@/components/header-unauthenticated';
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
import Cookies from 'js-cookie';
import useAccount from './hooks/use-account';

export const Onboarding = React.lazy(() => import('@/pages/onboarding'));
export const SignUp = React.lazy(() => import('@/pages/sign-up'));
export const SignUpVerify = React.lazy(() => import('@/pages/sign-up-verify'));
export const SignIn = React.lazy(() => import('@/pages/sign-in'));
export const SignInEmail = React.lazy(() => import('@/pages/sign-in-email'));
export const Consent = React.lazy(() => import('@/pages/consent'));
export const Index = React.lazy(() => import('@/pages'));
export const InTheStudio = React.lazy(() => import('@/pages/in-the-studio'));
export const InTheStudioDetail = React.lazy(() => import('@/pages/in-the-studio-detail'));
export const InTheStudioExternalDetail = React.lazy(() => import('@/pages/in-the-studio-external-detail'));
export const InTheStudioGroupSessionScheduled = React.lazy(
	() => import('@/pages/in-the-studio-group-session-scheduled')
);
export const InTheStudioGroupSessionByRequest = React.lazy(
	() => import('@/pages/in-the-studio-group-session-by-request')
);
export const OnYourTime = React.lazy(() => import('@/pages/on-your-time'));
export const SessionRequestThankYou = React.lazy(() => import('@/pages/session-request-thank-you'));
export const OnYourTimeDetail = React.lazy(() => import('@/pages/on-your-time-detail'));
export const Covid19Resources = React.lazy(() => import('@/pages/covid-19-resources'));
export const WellBeingResources = React.lazy(() => import('@/pages/well-being-resources'));
export const Privacy = React.lazy(() => import('@/pages/privacy'));
export const IntakeAssessment = React.lazy(() => import('@/pages/intake-assessment'));
export const OneOnOneResources = React.lazy(() => import('@/pages/one-on-one-resources'));
export const ConnectWithSupport = React.lazy(() => import('@/pages/connect-with-support'));
export const EhrLookup = React.lazy(() => import('@/pages/ehr-lookup'));
export const MyCalendar = React.lazy(() => import('@/pages/my-calendar'));
export const AppointmentDetails = React.lazy(() => import('@/pages/appointment-details'));
export const Feedback = React.lazy(() => import('@/pages/feedback'));
export const AccountSessionDetails = React.lazy(() => import('@/pages/account-session-details'));
export const GroupSessionsScheduled = React.lazy(() => import('@/pages/group-sessions-scheduled'));
export const GroupSessionsScheduledCreate = React.lazy(() => import('@/pages/group-sessions-scheduled-create'));
export const GroupSessionsByRequest = React.lazy(() => import('@/pages/group-sessions-by-request'));
export const GroupSessionsByRequestCreate = React.lazy(() => import('@/pages/group-sessions-by-request-create'));
export const RedirectToBackend = React.lazy(() => import('@/pages/redirect-to-backend'));
export const CmsOnYourTime = React.lazy(() => import('@/pages/admin-cms/on-your-time'));
export const OnYourTimeThanks = React.lazy(() => import('@/pages/on-your-time-thanks'));
export const InTheStudioThanks = React.lazy(() => import('@/pages/in-the-studio-thanks'));
export const ProviderDetail = React.lazy(() => import('@/pages/provider-detail'));
export const NoMatch = React.lazy(() => import('@/pages/no-match'));
export const CmsAvailableContent = React.lazy(() => import('@/pages/admin-cms/available-content'));
export const CreateOnYourTimeContent = React.lazy(() => import('@/pages/admin-cms/create-on-your-time-content'));
export const SignUpClaim = React.lazy(() => import('@/pages/sign-up-claim'));
export const ForgotPassword = React.lazy(() => import('@/pages/forgot-password'));
export const PasswordReset = React.lazy(() => import('@/pages/password-reset'));
export const StatsDashboard = React.lazy(() => import('@/pages/stats-dashboard'));
export const MySchedule = React.lazy(() => import('@/pages/scheduling/my-schedule'));
export const IntegratedCare = React.lazy(() => import('@/pages/ic/landing'));
export const ScreeningQuestions = React.lazy(() => import('@/pages/screening/screening-questions'));
export const Interaction = React.lazy(() => import('@/pages/interaction'));
export const InteractionInstances = React.lazy(() => import('@/pages/interaction-instances'));
export const InCrisis = React.lazy(() => import('@/pages/in-crisis'));
export const ConfirmAppointment = React.lazy(() => import('@/pages/confirm-appointment'));
export const TopicCenter = React.lazy(() => import('@/pages/topic-center'));
export const ResourceLibrary = React.lazy(() => import('@/pages/resource-library'));
export const ResourceLibraryTopic = React.lazy(() => import('@/pages/resource-library-topic'));

interface RouteGuardProps {
	account?: AccountModel;
	institution?: Institution;
}

export interface RouteConfig {
	path: string;
	private: boolean;
	routeGuard?: (guardProps: RouteGuardProps) => boolean;
	header?: React.ComponentType<any>;
	nav?: React.ComponentType<any>;
	main: React.ComponentType<any>;
}

export interface AppRoutesConfig {
	layout: React.ComponentType<any>;
	routes: RouteConfig[];
}

const isInstitutionSupportEnabledRouteGuard = ({ institution }: RouteGuardProps): boolean =>
	!!institution?.supportEnabled;
const isIntegratedCareRouteGuard = ({ institution, account }: RouteGuardProps) => !!institution?.integratedCareEnabled;
const isConsentRequiredRouteGuard = ({ institution }: RouteGuardProps) => !!institution?.requireConsentForm;
const isProviderRouteGuard = ({ account }: RouteGuardProps) => !!account && account.roleId === 'PROVIDER';
const isContactUsEnabledGuard = ({ institution }: RouteGuardProps) => !!institution?.contactUsEnabled;

const RedirectToSupport = () => {
	const match = useMatch<'supportRoleId', '/immediate-support/:supportRoleId'>('/immediate-support/:supportRoleId');
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { account } = useAccount();

	let routedSupportRoleId = match?.params.supportRoleId ?? '';

	if (routedSupportRoleId === 'therapist') {
		routedSupportRoleId = 'clinician';
	}

	searchParams.set('supportRoleId', routedSupportRoleId.toUpperCase());
	searchParams.set('immediateAccess', 'true');

	const searchString = searchParams.toString();
	useEffect(() => {
		const authRedirectUrl = `/connect-with-support?${searchString}`;

		if (!account) {
			Cookies.set('authRedirectUrl', authRedirectUrl);
		}

		navigate(
			{
				pathname: '/connect-with-support',
				search: searchString,
			},
			{
				replace: true,
			}
		);
	}, [account, navigate, searchString]);

	return null;
};

const ButtonlessHeaderLayout = () => {
	const { account } = useAccount();
	const navigate = useNavigate();

	useEffect(() => {
		if (account) {
			navigate('/');
		}
	}, [account, navigate]);

	return (
		<>
			<Header showHeaderButtons={false} />
			<Outlet />
		</>
	);
};

const UnauthenticatedHeaderLayout = () => {
	const { account } = useAccount();
	const navigate = useNavigate();

	useEffect(() => {
		if (account) {
			navigate('/');
		}
	}, [account, navigate]);

	return (
		<>
			<HeaderUnauthenticated />
			<Outlet />
		</>
	);
};

const DefaultFooterLayout = () => {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
};

const DefaultNoFooterLayout = () => {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
};

export const AppRoutes: AppRoutesConfig[] = [
	{
		layout: ButtonlessHeaderLayout,
		routes: [
			{
				path: '/onboarding',
				private: false,
				main: Onboarding,
			},
			{
				path: '/sign-up-verify',
				private: false,
				main: SignUpVerify,
			},
			{
				path: '/accounts/claim-invite/:accountInviteId',
				private: false,
				main: SignUpClaim,
			},
			{
				path: '/sign-in-sso',
				private: false,
				main: () => <Navigate to="/sign-in" replace />,
			},
			{
				path: '/sign-in-email',
				private: false,
				main: () => <Navigate to="/sign-in/email" replace />,
			},
			{
				path: '/forgot-password',
				private: false,
				main: ForgotPassword,
			},
			{
				path: '/accounts/reset-password/:passwordResetToken',
				private: false,
				main: PasswordReset,
			},
		],
	},

	{
		layout: UnauthenticatedHeaderLayout,
		routes: [
			{
				path: '/sign-up',
				private: false,
				main: SignUp,
			},
			{
				path: '/sign-in',
				private: false,
				main: SignIn,
			},
			{
				path: '/sign-in/email',
				private: false,
				main: SignInEmail,
			},
		],
	},

	{
		layout: DefaultFooterLayout,
		routes: [
			{
				path: '/',
				private: true,
				main: Index,
			},
			{
				path: '/in-the-studio',
				private: true,
				main: InTheStudio,
			},
			{
				path: '/in-the-studio-thanks',
				private: true,
				main: InTheStudioThanks,
			},
			{
				path: '/in-the-studio/:groupEventId',
				private: true,
				main: InTheStudioDetail,
			},
			{
				path: '/in-the-studio/external/:externalGroupEventTypeId',
				private: true,
				main: InTheStudioExternalDetail,
			},
			{
				path: '/in-the-studio/group-session-scheduled/:groupSessionId',
				private: true,
				main: InTheStudioGroupSessionScheduled,
			},
			{
				path: '/in-the-studio/group-session-by-request/:groupSessionRequestId',
				private: true,
				main: InTheStudioGroupSessionByRequest,
			},
			{
				path: '/on-your-time',
				private: true,
				main: OnYourTime,
			},
			{
				path: '/on-your-time-thanks',
				private: true,
				main: OnYourTimeThanks,
			},
			{
				path: '/thank-you',
				private: true,
				main: SessionRequestThankYou,
			},
			{
				path: '/on-your-time/:contentId',
				private: true,
				main: OnYourTimeDetail,
			},
			{
				path: '/covid-19-resources',
				private: true,
				main: Covid19Resources,
			},
			{
				path: '/well-being-resources',
				private: true,
				main: WellBeingResources,
			},
			{
				path: '/privacy',
				private: true,
				main: Privacy,
			},
			{
				path: '/immediate-support/:supportRoleId',
				private: false,
				main: RedirectToSupport,
			},
			{
				path: '/confirm-appointment',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: ConfirmAppointment,
			},
			{
				path: '/one-on-one-resources',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: OneOnOneResources,
			},
			{
				path: '/connect-with-support',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: ConnectWithSupport,
			},
			{
				path: '/my-calendar',
				private: true,
				main: MyCalendar,
			},
			{
				path: '/scheduling/*',
				private: true,
				routeGuard: isProviderRouteGuard,
				main: MySchedule,
			},
			{
				path: '/ic/*',
				private: true,
				routeGuard: isIntegratedCareRouteGuard,
				main: IntegratedCare,
			},
			{
				path: '/screening-questions/:screeningQuestionContextId',
				private: true,
				main: ScreeningQuestions,
			},
			{
				path: '/appointments/:appointmentId',
				private: true,
				main: AppointmentDetails,
			},
			{
				path: '/feedback',
				private: true,
				routeGuard: isContactUsEnabledGuard,
				main: Feedback,
			},
			{
				path: '/account-sessions/:accountSessionId/text',
				private: true,
				main: AccountSessionDetails,
			},
			{
				path: '/account-sessions/:accountSessionId/text',
				private: true,
				main: AccountSessionDetails,
			},
			{
				path: '/group-sessions/scheduled',
				private: true,
				main: GroupSessionsScheduled,
			},
			{
				path: '/group-sessions/scheduled/create',
				private: true,
				main: GroupSessionsScheduledCreate,
			},
			{
				path: '/group-sessions/scheduled/:groupSessionId/edit',
				private: true,
				main: GroupSessionsScheduledCreate,
			},
			{
				path: '/group-sessions/scheduled/:groupSessionId/view',
				private: true,
				main: GroupSessionsScheduledCreate,
			},
			{
				path: '/group-sessions/by-request',
				private: true,
				main: GroupSessionsByRequest,
			},
			{
				path: '/group-sessions/by-request/create',
				private: true,
				main: GroupSessionsByRequestCreate,
			},
			{
				path: '/group-sessions/by-request/:groupSessionId/edit',
				private: true,
				main: GroupSessionsByRequestCreate,
			},
			{
				path: '/group-session-reservations/:groupSessionReservationId/ical',
				private: true,
				main: RedirectToBackend,
			},
			{
				path: '/group-session-reservations/:groupSessionReservationId/google-calendar',
				private: true,
				main: RedirectToBackend,
			},
			{
				path: '/appointments/:appointmentId/ical',
				private: true,
				main: RedirectToBackend,
			},
			{
				path: '/appointments/:appointmentId/google-calendar',
				private: true,
				main: RedirectToBackend,
			},
			{
				path: '/providers/:providerId',
				private: true,
				main: ProviderDetail,
			},
			{
				path: '/interaction/:interactionInstanceId/option/:interactionOptionId',
				private: true,
				main: Interaction,
			},
			{
				path: '/interaction-instances/:interactionId',
				private: true,
				main: InteractionInstances,
			},
			{
				path: '/in-crisis',
				private: false,
				main: InCrisis,
			},
			{
				path: '/topic-centers/:topicCenterId',
				private: true,
				main: TopicCenter,
			},
			{
				path: '/resource-library',
				private: true,
				main: ResourceLibrary,
			},
			{
				path: '/resource-library/tag-groups/:tagGroupId',
				private: true,
				main: ResourceLibraryTopic,
			},
			{
				path: '*',
				private: false,
				main: NoMatch,
			},
		],
	},

	{
		layout: DefaultNoFooterLayout,
		routes: [
			{
				path: '/consent',
				private: true,
				main: Consent,
				routeGuard: isConsentRequiredRouteGuard,
			},
			{
				path: '/intake-assessment',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: IntakeAssessment,
			},
			{
				path: '/ehr-lookup',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: EhrLookup,
			},
			{
				path: '/scheduling/*',
				private: true,
				routeGuard: isProviderRouteGuard,
				main: MySchedule,
			},
			{
				path: '/screening-questions/:screeningQuestionContextId',
				private: true,
				main: ScreeningQuestions,
			},
			{
				path: '/cms/on-your-time',
				private: true,
				main: CmsOnYourTime,
			},
			{
				path: '/cms/on-your-time/create',
				private: true,
				main: CreateOnYourTimeContent,
			},
			{
				path: '/cms/available-content',
				private: true,
				main: CmsAvailableContent,
			},
			{
				path: '/stats-dashboard',
				private: true,
				main: StatsDashboard,
			},
			...(config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true'
				? [
						{
							path: `/providers/:providerId/profile`,
							private: true,
							main: ProviderManagementProfile,
						},
						{
							path: `/providers/:providerId/basics`,
							private: true,
							main: ProviderManagementBasics,
						},
						{
							path: `/providers/:providerId/clinical-background`,
							private: true,
							main: ProviderManagementClinicalBackground,
						},
						{
							path: `/providers/:providerId/communication`,
							private: true,
							main: ProviderManagementCommunication,
						},
						{
							path: `/providers/:providerId/bluejeans-connection`,
							private: true,
							main: ProviderManagementBluejeansConnection,
						},
						{
							path: `/providers/:providerId/payment-types-accepted`,
							private: true,
							main: ProviderManagementPaymentTypesAccepted,
						},
						{
							path: `/providers/:providerId/personal-details`,
							private: true,
							main: ProviderManagementPersonalDetails,
						},
						{
							path: `/providers/:providerId/cobalt-bio`,
							private: true,
							main: ProviderManagementCobaltBio,
						},
				  ]
				: []),
		],
	},
];
