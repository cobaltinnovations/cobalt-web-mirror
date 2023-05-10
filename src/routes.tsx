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
import ScreeningQuestionsPage from '@/pages/screening/screening-questions';
import Cookies from 'js-cookie';
import React from 'react';
import { LoaderFunctionArgs, Navigate, Outlet, RouteObject, redirect, useParams } from 'react-router-dom';

import { lazyLoadWithRefresh } from './lib/utils/error-utils';

import useAccount from './hooks/use-account';
import { immediateSupportLoader } from './immediate-support-loader';

import { AppDefaultLayout, AppErrorDefaultLayout } from './app-default-layout';

import MhicOrderAssessment from './routes/ic/mhic/order-assessment';
import PatientAssessmentComplete from './routes/ic/patient/assessment-complete';
import PatientDemographicsIntroduction from './routes/ic/patient/demographics-introduction';
import PatientDemographics from './routes/ic/patient/patient-demographics';
import PatientDemographicsThanks from './routes/ic/patient/demographics-thanks';
import PatientLanding from './routes/ic/patient/patient-landing';
import PatientConsent from './routes/ic/patient/patient-consent';
import { IntegratedCarePatientLayout } from './routes/ic/patient/patient-layout';
import { RoutedAppointmentDetailPanel } from './pages/scheduling/routed-appointment-detail-panel';
import { RoutedEditAppointmentPanel } from './pages/scheduling/routed-edit-appointment-panel';
import { RoutedEditAvailabilityPanel } from './pages/scheduling/routed-edit-availability-panel';
import { RoutedManageAvailailityPanel } from './pages/scheduling/routed-managed-availabilities-panel';
import { RoutedSelectedAvailabilityPanel } from './pages/scheduling/routed-selected-availability-panel';
import { routeRedirects } from './route-redirects';
import { LoginDestinationIdRouteMap } from './contexts/account-context';
import PatientAssessmentResults from './routes/ic/patient/assessment-results';
import { mhicShelfRouteObject } from './routes/ic/mhic/patient-order-shelf';

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

function requireAuthLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const accessToken = Cookies.get('accessToken');

	if (!accessToken) {
		Cookies.set('authRedirectUrl', url.pathname + url.search);
		return redirect('/sign-in');
	}

	return null;
}

function requireUnauthLoader() {
	const accessToken = Cookies.get('accessToken');

	if (accessToken) {
		return redirect('/');
	}

	return null;
}

function redirectCheckLoader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const redirectConfig = routeRedirects.find((c) => {
		if (c.caseSensitive) {
			return c.fromPath === url.pathname;
		}

		return c.fromPath.toLowerCase() === url.pathname.toLowerCase();
	});

	if (redirectConfig) {
		const redirctParams = new URLSearchParams({
			...redirectConfig.searchParams,
		});

		if (Cookies.get('track') === 'true') {
			redirctParams.set('track', 'true');
		}

		return redirect(`${redirectConfig.toPath}?${redirctParams.toString()}`);
	}

	return null;
}

export const RedirectToLoginDestination = () => {
	const { account } = useAccount();

	return <Navigate to={account ? LoginDestinationIdRouteMap[account.loginDestinationId] : '/'} replace />;
};

const RedirectToResourceLibrary = () => {
	const { contentId } = useParams<{ contentId: string }>();

	if (contentId) {
		return <Navigate to={`/resource-library/${contentId}`} replace />;
	}

	return <Navigate to="/resource-library" replace />;
};

const SupportEnabledRoutes = () => {
	const { institution } = useAccount();

	return institution.supportEnabled ? <Outlet /> : <NoMatch />;
};

const IntegratedCareEnabledRoutes = () => {
	const { institution } = useAccount();

	return institution?.integratedCareEnabled ? <Outlet /> : <NoMatch />;
};

const ProviderOnlyRoutes = () => {
	const { account } = useAccount();

	return account?.roleId === 'PROVIDER' ? <Outlet /> : <NoMatch />;
};

const ContactUsEnabledRoutes = () => {
	const { institution } = useAccount();

	return institution?.contactUsEnabled ? <Outlet /> : <NoMatch />;
};

export const routes: RouteObject[] = [
	{
		id: 'root',
		path: '/',
		lazy: () => import('@/routes/root'),
		children: [
			{
				path: 'auth',
				lazy: () => import('@/routes/auth'),
			},

			{
				path: 'mychart/authenticate',
				lazy: () => import('@/routes/auth'),
			},

			{
				path: 'immediate-support/:supportRoleId',
				loader: immediateSupportLoader,
			},

			{
				element: <AppDefaultLayout unauthenticated />,
				loader: requireUnauthLoader,
				children: [
					{
						path: 'sign-up',
						element: <SignUp />,
					},
					{
						path: 'sign-in',
						element: <SignIn />,
					},
					{
						path: 'sign-in/email',
						element: <SignInEmail />,
					},
				],
			},

			{
				element: <AppDefaultLayout hideHeaderButtons />,
				loader: requireAuthLoader,
				children: [
					{
						path: 'onboarding',
						element: <Onboarding />,
					},
					{
						path: 'sign-up-verify',
						element: <SignUpVerify />,
					},
					{
						path: 'accounts/claim-invite/:accountInviteId',
						element: <SignUpClaim />,
					},
					{
						path: 'sign-in-sso',
						element: <Navigate to="/sign-in" replace />,
					},
					{
						path: 'sign-in-email',
						element: <Navigate to="/sign-in/email" replace />,
					},
					{
						path: 'forgot-password',
						element: <ForgotPassword />,
					},
					{
						path: 'accounts/reset-password/:passwordResetToken',
						element: <PasswordReset />,
					},
				],
			},

			{
				element: <AppDefaultLayout />,
				errorElement: <AppErrorDefaultLayout />,
				loader: requireAuthLoader,
				children: [
					{
						index: true,
						element: <Index />,
					},
					{
						path: 'in-the-studio',
						element: <Navigate to="/group-sessions" replace />,
					},
					{
						path: 'in-the-studio-thanks',
						element: <InTheStudioThanks />,
					},
					{
						path: 'in-the-studio/group-session-scheduled/:groupSessionId',
						element: <InTheStudioGroupSessionScheduled />,
					},
					{
						path: 'in-the-studio/group-session-by-request/:groupSessionRequestId',
						element: <InTheStudioGroupSessionByRequest />,
					},
					{
						path: 'on-your-time',
						element: <RedirectToResourceLibrary />,
					},
					{
						path: 'on-your-time-thanks',
						element: <OnYourTimeThanks />,
					},
					{
						path: 'thank-you',
						element: <SessionRequestThankYou />,
					},
					{
						path: 'on-your-time/:contentId',
						element: <RedirectToResourceLibrary />,
					},
					{
						path: 'covid-19-resources',
						element: <Covid19Resources />,
					},
					{
						path: 'well-being-resources',
						element: <WellBeingResources />,
					},
					{
						path: 'privacy',
						element: <Privacy />,
					},
					{
						path: 'my-calendar',
						element: <MyCalendar />,
					},

					{
						element: <SupportEnabledRoutes />,
						children: [
							{
								path: 'intake-assessment',
								element: <IntakeAssessment />,
							},
							{
								path: 'one-on-one-resources',
								element: <OneOnOneResources />,
							},
							{
								path: 'connect-with-support',
								element: <ConnectWithSupport />,
							},
							{
								path: 'connect-with-support/medication-prescriber',
								element: <ConnectWithSupportMedicationPrescriber />,
							},
							{
								path: 'connect-with-support/:urlName',
								element: <ConnectWithSupportV2 />,
							},
							{
								path: 'ehr-lookup',
								element: <EhrLookup />,
							},
						],
					},
					{
						path: 'confirm-appointment',
						element: <ConfirmAppointment />,
					},

					{
						element: <ProviderOnlyRoutes />,
						children: [
							{
								path: 'scheduling',
								element: <MySchedule />,
								children: [
									{
										path: 'appointments/new-appointment',
										element: <RoutedEditAppointmentPanel />,
									},
									{
										path: 'appointments/:appointmentId/edit',
										element: <RoutedEditAppointmentPanel />,
									},
									{
										path: 'appointments/:appointmentId',
										element: <RoutedAppointmentDetailPanel />,
									},
									{
										path: 'availabilities',
										element: <RoutedManageAvailailityPanel />,
									},
									{
										path: 'availabilities/new-availability',
										element: <RoutedEditAvailabilityPanel />,
									},
									{
										path: 'availabilities/new-blocked-time',
										element: <RoutedEditAvailabilityPanel />,
									},
									{
										path: 'availabilities/:logicalAvailabilityId/edit',
										element: <RoutedEditAvailabilityPanel />,
									},
									{
										path: 'availabilities/:logicalAvailabilityId',
										element: <RoutedSelectedAvailabilityPanel />,
									},
								],
							},
						],
					},

					{
						element: <ContactUsEnabledRoutes />,
						children: [
							{
								path: 'feedback',
								element: <Feedback />,
							},
						],
					},

					{
						path: 'screening-questions/:screeningQuestionContextId',
						element: <ScreeningQuestions />,
					},
					{
						path: 'appointments/:appointmentId',
						element: <AppointmentDetails />,
					},
					{
						path: 'account-sessions/:accountSessionId/text',
						element: <AccountSessionDetails />,
					},
					{
						path: 'account-sessions/:accountSessionId/text',
						element: <AccountSessionDetails />,
					},
					{
						path: 'group-sessions',
						element: <GroupSessions />,
					},
					{
						path: 'group-sessions/request',
						element: <GroupSessionsRequest />,
					},
					{
						path: 'group-sessions/scheduled',
						element: <GroupSessionsScheduled />,
					},
					{
						path: 'group-sessions/scheduled/create',
						element: <GroupSessionsScheduledCreate />,
					},
					{
						path: 'group-sessions/scheduled/:groupSessionId/edit',
						element: <GroupSessionsScheduledCreate />,
					},
					{
						path: 'group-sessions/scheduled/:groupSessionId/view',
						element: <GroupSessionsScheduledCreate />,
					},
					{
						path: 'group-sessions/by-request',
						element: <GroupSessionsByRequest />,
					},
					{
						path: 'group-sessions/by-request/create',
						element: <GroupSessionsByRequestCreate />,
					},
					{
						path: 'group-sessions/by-request/:groupSessionId/edit',
						element: <GroupSessionsByRequestCreate />,
					},
					{
						path: 'group-session-reservations/:groupSessionReservationId/ical',
						element: <RedirectToBackend />,
					},
					{
						path: 'group-session-reservations/:groupSessionReservationId/google-calendar',
						element: <RedirectToBackend />,
					},
					{
						path: 'appointments/:appointmentId/ical',
						element: <RedirectToBackend />,
					},
					{
						path: 'appointments/:appointmentId/google-calendar',
						element: <RedirectToBackend />,
					},
					{
						path: 'cms/on-your-time',
						element: <CmsOnYourTime />,
					},
					{
						path: 'cms/on-your-time/create',
						element: <CreateOnYourTimeContent />,
					},
					{
						path: 'cms/available-content',
						element: <CmsAvailableContent />,
					},
					{
						path: 'stats-dashboard',
						element: <StatsDashboard />,
					},
					{
						path: 'admin/reports',
						element: <Reports />,
					},
					{
						path: 'providers/:providerId',
						element: <ProviderDetail />,
					},
					...(config.COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE === 'true'
						? [
								{
									path: 'providers/:providerId/profile',
									element: <ProviderManagementProfile />,
								},
								{
									path: 'providers/:providerId/basics',
									element: <ProviderManagementBasics />,
								},
								{
									path: 'providers/:providerId/clinical-background',
									element: <ProviderManagementClinicalBackground />,
								},
								{
									path: 'providers/:providerId/communication',
									element: <ProviderManagementCommunication />,
								},
								{
									path: 'providers/:providerId/bluejeans-connection',
									element: <ProviderManagementBluejeansConnection />,
								},
								{
									path: 'providers/:providerId/payment-types-accepted',
									element: <ProviderManagementPaymentTypesAccepted />,
								},
								{
									path: 'providers/:providerId/personal-details',
									element: <ProviderManagementPersonalDetails />,
								},
								{
									path: 'providers/:providerId/cobalt-bio',
									element: <ProviderManagementCobaltBio />,
								},
						  ]
						: []),
					{
						path: 'interaction/:interactionInstanceId/option/:interactionOptionId',
						element: <Interaction />,
					},
					{
						path: 'interaction-instances/:interactionId',
						element: <InteractionInstances />,
					},
					{
						path: 'in-crisis',
						element: <InCrisis />,
					},
					{
						path: 'topic-centers/:topicCenterId',
						element: <TopicCenter />,
					},
					{
						path: 'user-settings',
						element: <UserSettings />,
					},
					{
						path: 'resource-library',
						element: <ResourceLibrary />,
					},
					{
						path: 'resource-library/tag-groups/:tagGroupId',
						element: <ResourceLibraryTopic />,
					},
					{
						path: 'resource-library/tags/:tagId',
						element: <ResourceLibraryTags />,
					},
					{
						path: 'resource-library/:contentId',
						element: <ResourceLibraryDetail />,
					},

					{
						path: '*',
						loader: redirectCheckLoader,
						element: <NoMatch />,
					},
				],
			},

			{
				element: <IntegratedCareEnabledRoutes />,
				errorElement: <AppErrorDefaultLayout />,
				loader: requireAuthLoader,
				children: [
					{
						id: 'ic',
						path: 'ic',
						lazy: () => import('@/routes/ic/landing'),
						children: [
							{
								index: true,
								element: <RedirectToLoginDestination />,
							},
							{
								id: 'mhic',
								path: 'mhic',
								lazy: () => import('@/routes/ic/mhic/mhic-layout'),
								children: [
									{
										id: 'mhic-my-panel',
										lazy: () => import('@/routes/ic/mhic/my-panel'),
										children: [
											{
												index: true,
												element: <Navigate to="overview" />,
											},
											{
												path: 'overview',
												id: 'mhic-overview',
												lazy: () => import('@/routes/ic/mhic/overview'),
												children: [mhicShelfRouteObject],
											},
											{
												path: 'my-patients',
												children: [
													{
														index: true,
														element: <Navigate to="all" />,
													},
													{
														id: 'mhic-my-patients',
														path: ':mhicView',
														lazy: () => import('@/routes/ic/mhic/my-patients'),
														children: [mhicShelfRouteObject],
													},
												],
											},
										],
									},
									{
										id: 'mhic-search-results',
										path: 'orders/search',
										lazy: () => import('@/routes/ic/mhic/search-results'),
										children: [mhicShelfRouteObject],
									},
									{
										path: 'orders/unassigned',
										children: [
											{
												index: true,
												element: <Navigate to="new" />,
											},
											{
												id: 'mhic-orders-unassigned',
												path: ':activeTab',
												lazy: () => import('@/routes/ic/mhic/orders-unassigned'),
												children: [mhicShelfRouteObject],
											},
										],
									},
									{
										id: 'mhic-orders-assigned',
										path: 'orders/assigned',
										lazy: () => import('@/routes/ic/mhic/orders-assigned'),
										children: [mhicShelfRouteObject],
									},
									{
										id: 'mhic-orders-closed',
										path: 'orders/closed',
										lazy: () => import('@/routes/ic/mhic/orders-closed'),
										children: [mhicShelfRouteObject],
									},
									{
										id: 'mhic-patient-order',
										path: 'orders/:patientOrderId',
										lazy: () => import('@/routes/ic/mhic/order-layout'),
										children: [
											{
												index: true,
												element: <Navigate to="assessment" replace />,
											},
											{
												path: 'assessment',
												element: <MhicOrderAssessment />,
											},
											{
												path: 'assessment/:screeningQuestionContextId',
												element: <ScreeningQuestionsPage />,
											},
										],
									},
									{
										path: 'reports',
										element: <NoMatch />,
									},
									{
										path: '*',
										element: <NoMatch />,
									},
								],
							},
							{
								path: 'patient',
								element: <IntegratedCarePatientLayout />,
								children: [
									{
										index: true,
										element: <PatientLanding />,
									},
									{
										path: 'consent',
										element: <PatientConsent />,
									},
									{
										path: 'demographics-introduction',
										element: <PatientDemographicsIntroduction />,
									},
									{
										path: 'demographics',
										element: <PatientDemographics />,
									},
									{
										path: 'demographics-thanks',
										element: <PatientDemographicsThanks />,
									},
									{
										path: 'assessment-complete',
										element: <PatientAssessmentComplete />,
									},
									{
										path: 'assessment-results',
										element: <PatientAssessmentResults />,
									},
									{
										path: 'connect-with-support/bhp',
										element: <ConnectWithSupportV2 />,
									},
									{
										path: '*',
										element: <NoMatch />,
									},
								],
							},
						],
					},
				],
			},
		],
	},
];
