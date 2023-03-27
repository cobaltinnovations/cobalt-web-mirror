import React, { useEffect } from 'react';
import { Outlet, Navigate, useMatch, useSearchParams, useNavigate, useParams } from 'react-router-dom';

import config from '@/lib/config';
import { Institution } from '@/lib/models/institution';
import { AccountModel } from '@/lib/models';
import Header from '@/components/header';
import HeaderV2 from '@/components/header-v2';
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
import { lazyLoadWithRefresh } from './lib/utils/error-utils';

export const Onboarding = lazyLoadWithRefresh(() => import('@/pages/onboarding'));
export const SignUp = lazyLoadWithRefresh(() => import('@/pages/sign-up'));
export const SignUpVerify = lazyLoadWithRefresh(() => import('@/pages/sign-up-verify'));
export const SignIn = lazyLoadWithRefresh(() => import('@/pages/sign-in'));
export const SignInEmail = lazyLoadWithRefresh(() => import('@/pages/sign-in-email'));
export const Index = lazyLoadWithRefresh(() => import('@/pages'));
export const InTheStudio = lazyLoadWithRefresh(() => import('@/pages/in-the-studio'));
export const InTheStudioGroupSessionScheduled = lazyLoadWithRefresh(
	() => import('@/pages/in-the-studio-group-session-scheduled')
);
export const InTheStudioGroupSessionByRequest = lazyLoadWithRefresh(
	() => import('@/pages/in-the-studio-group-session-by-request')
);
export const SessionRequestThankYou = lazyLoadWithRefresh(() => import('@/pages/session-request-thank-you'));

export const Covid19Resources = lazyLoadWithRefresh(() => import('@/pages/covid-19-resources'));
export const WellBeingResources = lazyLoadWithRefresh(() => import('@/pages/well-being-resources'));
export const Privacy = lazyLoadWithRefresh(() => import('@/pages/privacy'));
export const IntakeAssessment = lazyLoadWithRefresh(() => import('@/pages/intake-assessment'));
export const OneOnOneResources = lazyLoadWithRefresh(() => import('@/pages/one-on-one-resources'));
export const ConnectWithSupport = lazyLoadWithRefresh(() => import('@/pages/connect-with-support'));
export const ConnectWithSupportV2 = lazyLoadWithRefresh(() => import('@/pages/connect-with-support-v2'));
export const ConnectWithSupportMedicationPrescriber = lazyLoadWithRefresh(
	() => import('@/pages/connect-with-support-medication-prescriber')
);
export const EhrLookup = lazyLoadWithRefresh(() => import('@/pages/ehr-lookup'));
export const MyCalendar = lazyLoadWithRefresh(() => import('@/pages/my-calendar'));
export const AppointmentDetails = lazyLoadWithRefresh(() => import('@/pages/appointment-details'));
export const Feedback = lazyLoadWithRefresh(() => import('@/pages/feedback'));
export const AccountSessionDetails = lazyLoadWithRefresh(() => import('@/pages/account-session-details'));
export const GroupSessions = lazyLoadWithRefresh(() => import('@/pages/group-sessions'));
export const GroupSessionsRequest = lazyLoadWithRefresh(() => import('@/pages/group-sessions-request'));
export const GroupSessionsScheduled = lazyLoadWithRefresh(() => import('@/pages/group-sessions-scheduled'));
export const GroupSessionsScheduledCreate = lazyLoadWithRefresh(
	() => import('@/pages/group-sessions-scheduled-create')
);
export const GroupSessionsByRequest = lazyLoadWithRefresh(() => import('@/pages/group-sessions-by-request'));
export const GroupSessionsByRequestCreate = lazyLoadWithRefresh(
	() => import('@/pages/group-sessions-by-request-create')
);
export const RedirectToBackend = lazyLoadWithRefresh(() => import('@/pages/redirect-to-backend'));
export const CmsOnYourTime = lazyLoadWithRefresh(() => import('@/pages/admin-cms/on-your-time'));
export const OnYourTimeThanks = lazyLoadWithRefresh(() => import('@/pages/on-your-time-thanks'));
export const InTheStudioThanks = lazyLoadWithRefresh(() => import('@/pages/in-the-studio-thanks'));
export const ProviderDetail = lazyLoadWithRefresh(() => import('@/pages/provider-detail'));
export const NoMatch = lazyLoadWithRefresh(() => import('@/pages/no-match'));
export const CmsAvailableContent = lazyLoadWithRefresh(() => import('@/pages/admin-cms/available-content'));
export const CreateOnYourTimeContent = lazyLoadWithRefresh(
	() => import('@/pages/admin-cms/create-on-your-time-content')
);
export const SignUpClaim = lazyLoadWithRefresh(() => import('@/pages/sign-up-claim'));
export const ForgotPassword = lazyLoadWithRefresh(() => import('@/pages/forgot-password'));
export const PasswordReset = lazyLoadWithRefresh(() => import('@/pages/password-reset'));
export const StatsDashboard = lazyLoadWithRefresh(() => import('@/pages/stats-dashboard'));
export const Reports = lazyLoadWithRefresh(() => import('@/pages/admin-cms/reports'));
export const MySchedule = lazyLoadWithRefresh(() => import('@/pages/scheduling/my-schedule'));
export const IntegratedCare = lazyLoadWithRefresh(() => import('@/pages/ic/landing'));
export const ScreeningQuestions = lazyLoadWithRefresh(() => import('@/pages/screening/screening-questions'));
export const Interaction = lazyLoadWithRefresh(() => import('@/pages/interaction'));
export const InteractionInstances = lazyLoadWithRefresh(() => import('@/pages/interaction-instances'));
export const InCrisis = lazyLoadWithRefresh(() => import('@/pages/in-crisis'));
export const ConfirmAppointment = lazyLoadWithRefresh(() => import('@/pages/confirm-appointment'));
export const TopicCenter = lazyLoadWithRefresh(() => import('@/pages/topic-center'));
export const UserSettings = lazyLoadWithRefresh(() => import('@/pages/user-settings'));
export const ResourceLibrary = lazyLoadWithRefresh(() => import('@/pages/resource-library'));
export const ResourceLibraryTopic = lazyLoadWithRefresh(() => import('@/pages/resource-library-topic'));
export const ResourceLibraryTags = lazyLoadWithRefresh(() => import('@/pages/resource-library-tags'));
export const ResourceLibraryDetail = lazyLoadWithRefresh(() => import('@/pages/resource-library-detail'));

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

const RedirectToResourceLibrary = () => {
	const { contentId } = useParams<{ contentId: string }>();

	if (contentId) {
		return <Navigate to={`/resource-library/${contentId}`} replace />;
	}

	return <Navigate to="/resource-library" replace />;
};

const RedirectToGroupSessions = () => {
	return <Navigate to="/group-sessions" replace />;
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

const DefaultLayout = () => {
	const { institution } = useAccount();

	return (
		<>
			{institution?.featuresEnabled ? <HeaderV2 /> : <Header />}
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
		layout: () => <Outlet />,
		routes: [
			{
				path: '/ic/*',
				private: true,
				routeGuard: isIntegratedCareRouteGuard,
				main: IntegratedCare,
			},
		],
	},
	{
		layout: DefaultLayout,
		routes: [
			{
				path: '/',
				private: true,
				main: Index,
			},
			{
				path: '/in-the-studio',
				private: true,
				main: RedirectToGroupSessions,
			},
			{
				path: '/in-the-studio-thanks',
				private: true,
				main: InTheStudioThanks,
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
				main: RedirectToResourceLibrary,
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
				main: RedirectToResourceLibrary,
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
				path: '/intake-assessment',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: IntakeAssessment,
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
				path: '/connect-with-support/medication-prescriber',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: ConnectWithSupportMedicationPrescriber,
			},
			{
				path: '/connect-with-support/:urlName',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: ConnectWithSupportV2,
			},
			{
				path: '/ehr-lookup',
				private: true,
				routeGuard: isInstitutionSupportEnabledRouteGuard,
				main: EhrLookup,
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
				path: '/group-sessions',
				private: true,
				main: GroupSessions,
			},
			{
				path: '/group-sessions/request',
				private: true,
				main: GroupSessionsRequest,
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
			{
				path: '/admin/reports',
				private: true,
				main: Reports,
			},
			{
				path: '/providers/:providerId',
				private: true,
				main: ProviderDetail,
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
				path: '/user-settings',
				private: true,
				main: UserSettings,
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
				path: '/resource-library/tags/:tagId',
				private: true,
				main: ResourceLibraryTags,
			},
			{
				path: '/resource-library/:contentId',
				private: true,
				main: ResourceLibraryDetail,
			},
			{
				path: '*',
				private: false,
				main: NoMatch,
			},
		],
	},
];
