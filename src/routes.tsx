import { config } from '@/config';

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
import React, { useMemo } from 'react';
import { LoaderFunctionArgs, Navigate, Outlet, RouteObject, redirect, useParams } from 'react-router-dom';

import { lazyLoadWithRefresh } from './lib/utils/error-utils';

import useAccount from './hooks/use-account';

import { AppDefaultLayout, AppErrorDefaultLayout } from './app-default-layout';

import MhicOrderAssessment from './routes/ic/mhic/order-assessment';
import PatientAssessmentComplete from './routes/ic/patient/assessment-complete';
import PatientDemographicsIntroduction from './routes/ic/patient/demographics-introduction';
import PatientDemographics from './routes/ic/patient/patient-demographics';
import PatientDemographicsThanks from './routes/ic/patient/demographics-thanks';
import { RoutedAppointmentDetailPanel } from './pages/scheduling/routed-appointment-detail-panel';
import { RoutedEditAppointmentPanel } from './pages/scheduling/routed-edit-appointment-panel';
import { RoutedEditAvailabilityPanel } from './pages/scheduling/routed-edit-availability-panel';
import { RoutedManageAvailailityPanel } from './pages/scheduling/routed-managed-availabilities-panel';
import { RoutedSelectedAvailabilityPanel } from './pages/scheduling/routed-selected-availability-panel';
import { routeRedirects } from './route-redirects';
import { LoginDestinationIdRouteMap } from './contexts/account-context';
import PatientAssessmentResults from './routes/ic/patient/assessment-results';
import { mhicShelfRouteObject } from './routes/ic/mhic/patient-order-shelf';
import PatientCheckIn from './routes/ic/patient/patient-check-in';
import { FeatureId, ROLE_ID } from './lib/models';

export interface RouteHandle {
	hideFooter?: boolean;
	hideFooterContactUs?: boolean;
}

export const Onboarding = lazyLoadWithRefresh(() => import('@/pages/onboarding'));
export const SignUp = lazyLoadWithRefresh(() => import('@/pages/sign-up'));
export const SignUpVerify = lazyLoadWithRefresh(() => import('@/pages/sign-up-verify'));
export const SignIn = lazyLoadWithRefresh(() => import('@/pages/sign-in'));
export const SignInEmail = lazyLoadWithRefresh(() => import('@/pages/sign-in-email'));
export const Index = lazyLoadWithRefresh(() => import('@/pages'));
export const InTheStudioGroupSessionByRequest = lazyLoadWithRefresh(
	() => import('@/pages/in-the-studio-group-session-by-request')
);
export const SessionRequestThankYou = lazyLoadWithRefresh(() => import('@/pages/session-request-thank-you'));

export const Covid19Resources = lazyLoadWithRefresh(() => import('@/pages/covid-19-resources'));
export const WellBeingResources = lazyLoadWithRefresh(() => import('@/pages/well-being-resources'));
export const Privacy = lazyLoadWithRefresh(() => import('@/pages/privacy'));
export const IntakeAssessment = lazyLoadWithRefresh(() => import('@/pages/intake-assessment'));

export const ConnectWithSupportV2 = lazyLoadWithRefresh(() => import('@/pages/connect-with-support-v2'));
export const ConnectWithSupportMedicationPrescriber = lazyLoadWithRefresh(
	() => import('@/pages/connect-with-support-medication-prescriber')
);
export const ConnectWithSupportMentalHealthProviders = lazyLoadWithRefresh(
	() => import('@/pages/connect-with-support-mental-health-providers')
);
export const ConnectWithSupportMentalHealthRecommendations = lazyLoadWithRefresh(
	() => import('@/pages/connect-with-support-mental-health-recommendations')
);

export const AppointmentDetails = lazyLoadWithRefresh(() => import('@/pages/appointment-details'));
export const Feedback = lazyLoadWithRefresh(() => import('@/pages/feedback'));
export const AccountSessionDetails = lazyLoadWithRefresh(() => import('@/pages/account-session-details'));
export const GroupSessions = lazyLoadWithRefresh(() => import('@/pages/group-sessions'));
export const GroupSessionsOg = lazyLoadWithRefresh(() => import('@/pages/group-sessions-og'));
export const GroupSessionsRequest = lazyLoadWithRefresh(() => import('@/pages/group-sessions-request'));
// export const GroupSessionsByRequest = lazyLoadWithRefresh(() => import('@/pages/group-sessions-by-request'));
// export const GroupSessionsByRequestCreate = lazyLoadWithRefresh(
// 	() => import('@/pages/group-sessions-by-request-create')
// );
export const RedirectToBackend = lazyLoadWithRefresh(() => import('@/pages/redirect-to-backend'));
export const OnYourTimeThanks = lazyLoadWithRefresh(() => import('@/pages/on-your-time-thanks'));
// export const InTheStudioThanks = lazyLoadWithRefresh(() => import('@/pages/in-the-studio-thanks'));
export const NoMatch = lazyLoadWithRefresh(() => import('@/pages/no-match'));
export const SignUpClaim = lazyLoadWithRefresh(() => import('@/pages/sign-up-claim'));
export const ForgotPassword = lazyLoadWithRefresh(() => import('@/pages/forgot-password'));
export const PasswordReset = lazyLoadWithRefresh(() => import('@/pages/password-reset'));
export const Reports = lazyLoadWithRefresh(() => import('@/pages/admin-cms/reports'));
export const MySchedule = lazyLoadWithRefresh(() => import('@/pages/scheduling/my-schedule'));

export const ScreeningQuestionsPage = lazyLoadWithRefresh(() => import('@/pages/screening/screening-questions'));
export const Interaction = lazyLoadWithRefresh(() => import('@/pages/interaction'));
export const InteractionInstances = lazyLoadWithRefresh(() => import('@/pages/interaction-instances'));
export const InCrisis = lazyLoadWithRefresh(() => import('@/pages/in-crisis'));
export const ConfirmAppointment = lazyLoadWithRefresh(() => import('@/pages/confirm-appointment'));
export const CommunityPage = lazyLoadWithRefresh(() => import('@/pages/community-page'));
export const FeaturedTopic = lazyLoadWithRefresh(() => import('@/pages/featured-topic'));
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

const RedirectToAdminPathOrRender = ({ pathname, element }: { pathname: string; element: JSX.Element }) => {
	const { account } = useAccount();

	return account?.roleId === ROLE_ID.ADMINISTRATOR ? <Navigate to={`/admin/${pathname}`} replace /> : element;
};

const RedirectToAdminHome = () => {
	const { account } = useAccount();

	if (account?.accountCapabilityFlags.canAdministerContent) {
		return <Navigate to="my-content" />;
	} else if (account?.accountCapabilityFlags.canAdministerGroupSessions) {
		return <Navigate to="group-sessions" />;
	} else if (account?.accountCapabilityFlags.canViewProviderReports) {
		return <Navigate to="reports" />;
	} else if (account?.accountCapabilityFlags.canViewAnalytics) {
		return <Navigate to="analytics" />;
	} else {
		return <NoMatch />;
	}
};

const RedirectToResourceLibrary = () => {
	const { contentId } = useParams<{ contentId: string }>();

	if (contentId) {
		return <Navigate to={`/resource-library/${contentId}`} replace />;
	}

	return <Navigate to="/resource-library" replace />;
};

const RedirectToGroupSessionDetail = () => {
	const { groupSessionId } = useParams<{
		groupSessionId: string;
	}>();

	if (groupSessionId) {
		return <Navigate to={`/group-sessions/${groupSessionId}`} replace />;
	}

	return <Navigate to="/group-sessions" replace />;
};

const RedirectToCommunityPage = () => {
	const { topicCenterId } = useParams<{ topicCenterId: string }>();

	if (topicCenterId) {
		return <Navigate to={`/community/${topicCenterId}`} replace />;
	}

	return <Navigate to="/" replace />;
};

const ToggledOutlet = ({ isEnabled }: { isEnabled: (accountContext: ReturnType<typeof useAccount>) => boolean }) => {
	const accountContext = useAccount();

	const canPassthrough = useMemo(() => {
		return isEnabled(accountContext);
	}, [accountContext, isEnabled]);

	return canPassthrough ? <Outlet /> : <NoMatch />;
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
				id: 'study-onboarding',
				path: 'studies/:studyIdOrUrlName/onboarding',
				lazy: () => import('@/routes/study-onboarding'),
			},

			{
				path: 'mychart/authenticate',
				lazy: () => import('@/routes/auth'),
			},

			{
				// legacy/backwards compatibility
				path: 'immediate-support/:supportRoleId',
				element: <Navigate to="/" replace />,
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
						// legacy/backwards compatibility
						path: 'sign-in-sso',
						element: <Navigate to="/sign-in" replace />,
					},
					{
						// legacy/backwards compatibility
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
						// legacy/backwards compatibility
						path: 'in-the-studio',
						element: <Navigate to="/group-sessions" replace />,
					},
					// {
					// 	path: 'in-the-studio-thanks',
					// 	element: <InTheStudioThanks />,
					// },
					{
						// legacy/backwards compatibility
						path: 'in-the-studio/group-session-scheduled/:groupSessionId',
						element: <RedirectToGroupSessionDetail />,
					},
					{
						// legacy/backwards compatibility
						path: 'in-the-studio/group-session-by-request/:groupSessionRequestId',
						element: <InTheStudioGroupSessionByRequest />,
					},
					{
						// legacy/backwards compatibility
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
						// legacy/backwards compatibility
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
						id: 'my-calendar',
						path: 'my-calendar',
						lazy: () => import('@/routes/my-calendar'),
					},
					{
						element: (
							<ToggledOutlet
								isEnabled={({ institution }) => {
									return institution.supportEnabled;
								}}
							/>
						),
						children: [
							{
								path: 'intake-assessment',
								element: <IntakeAssessment />,
							},
							{
								// legacy/backwards compatibility
								path: 'one-on-one-resources',
								element: <Navigate to="/" replace />,
							},
							{
								// legacy/backwards compatibility
								path: 'connect-with-support',
								element: <Navigate to="/" replace />,
							},
							{
								path: 'counseling-services',
								lazy: () => import('@/routes/counseling-services'),
							},
							{
								path: 'connect-with-support/medication-prescriber',
								element: <ConnectWithSupportMedicationPrescriber />,
							},
							{
								element: (
									<ToggledOutlet
										isEnabled={({ institution }) => {
											return institution?.epicFhirEnabled;
										}}
									/>
								),
								children: [
									{
										path: 'connect-with-support/mental-health-providers',
										element: <ConnectWithSupportMentalHealthProviders />,
									},
									{
										path: '/connect-with-support/recommendations',
										element: <ConnectWithSupportMentalHealthRecommendations />,
									},
								],
							},
							{
								path: 'connect-with-support/:urlName',
								element: <ConnectWithSupportV2 />,
							},
						],
					},
					{
						path: 'confirm-appointment',
						element: <ConfirmAppointment />,
					},
					{
						element: (
							<ToggledOutlet
								isEnabled={({ account }) => {
									return account?.roleId === ROLE_ID.PROVIDER;
								}}
							/>
						),
						handle: {
							hideFooter: true,
						} as RouteHandle,
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
						element: (
							<ToggledOutlet
								isEnabled={({ institution }) => {
									return institution.contactUsEnabled;
								}}
							/>
						),
						children: [
							{
								path: 'feedback',
								element: <Feedback />,
							},
						],
					},

					{
						path: 'screening-questions/:screeningQuestionContextId',
						element: <ScreeningQuestionsPage />,
						handle: {
							hideFooterContactUs: true,
						} as RouteHandle,
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
						element: <Outlet />,
						children: [
							{
								index: true,
								element: <GroupSessionsOg />,
							},
							{
								path: 'create/:action?/:groupSessionId?',
								element: (
									<ToggledOutlet
										isEnabled={({ institution }) => {
											return institution?.userSubmittedGroupSessionEnabled;
										}}
									/>
								),
								children: [
									{
										id: 'group-session-form',
										index: true,
										lazy: () => import('@/routes/admin/group-sessions/group-session-form'),
										handle: {
											hideFooter: true,
										} as RouteHandle,
									},
								],
							},
							{
								path: 'request',
								element: <GroupSessionsRequest />,
							},
							{
								// legacy/backwards compatibility
								path: 'by-request',
								element: (
									<RedirectToAdminPathOrRender pathname="group-sessions" element={<NoMatch />} />
								),
							},
							{
								// legacy/backwards compatibility
								path: 'by-request/create',
								element: (
									<RedirectToAdminPathOrRender pathname="group-sessions" element={<NoMatch />} />
								),
							},
							{
								// legacy/backwards compatibility
								path: 'by-request/:groupSessionId/edit',
								element: (
									<RedirectToAdminPathOrRender pathname="group-sessions" element={<NoMatch />} />
								),
							},
							{
								path: 'collection/:groupSessionCollectionUrlName',
								lazy: () => import('@/routes/group-session-collection-detail'),
							},
							{
								path: ':groupSessionIdOrUrlName',
								lazy: () => import('@/routes/group-session-detail'),
							},
						],
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
						// legacy/backwards compatibility
						path: 'cms/on-your-time',
						element: <RedirectToAdminPathOrRender pathname="resources" element={<NoMatch />} />,
					},
					{
						// legacy/backwards compatibility
						path: 'cms/on-your-time/create',
						element: <RedirectToAdminPathOrRender pathname="resources/add" element={<NoMatch />} />,
					},
					{
						// legacy/backwards compatibility
						path: 'cms/available-content',
						element: <RedirectToAdminPathOrRender pathname="resources" element={<NoMatch />} />,
					},
					{
						path: 'stats-dashboard',
						element: <RedirectToAdminPathOrRender pathname="analytics" element={<NoMatch />} />,
					},
					{
						id: 'provider-detail',
						path: 'providers/:urlName',
						lazy: () => import('@/routes/provider-detail'),
					},
					...(config.providerManagementFeature
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
						path: 'faqs',
						lazy: () => import('@/routes/faqs'),
					},
					{
						path: 'faqs/:faqUrlName',
						lazy: () => import('@/routes/faqs-detail'),
					},
					{
						path: 'topic-centers/:topicCenterId',
						element: <RedirectToCommunityPage />,
					},
					{
						path: 'featured-topics/:topicCenterId',
						element: <FeaturedTopic />,
					},
					{
						path: 'community/:topicCenterId',
						element: <CommunityPage />,
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
						path: 'institution-resources',
						element: (
							<ToggledOutlet
								isEnabled={({ institution }) => {
									return (
										institution.features.findIndex(
											(feature) => feature.featureId === FeatureId.INSTITUTION_RESOURCES
										) > -1
									);
								}}
							/>
						),
						children: [
							{
								id: 'institution-resource-groups',
								index: true,
								lazy: () => import('@/routes/institution-resource-groups'),
							},
							{
								id: 'institution-resource-group-detail',
								path: ':institutionResourceGroupUrlNameOrId',
								lazy: () => import('@/routes/institution-resource-group-detail'),
							},
						],
					},
					{
						id: 'resource-navigator',
						path: 'resource-navigator',
						lazy: () => import('@/routes/resource-navigator'),
						handle: {
							hideFooterContactUs: true,
						} as RouteHandle,
					},
					{
						path: '*',
						loader: redirectCheckLoader,
						element: <NoMatch />,
					},
				],
			},
			{
				element: (
					<ToggledOutlet
						isEnabled={({ account }) => {
							return account?.roleId === ROLE_ID.ADMINISTRATOR;
						}}
					/>
				),
				errorElement: <AppErrorDefaultLayout />,
				loader: requireAuthLoader,
				children: [
					{
						id: 'admin',
						path: 'admin',
						lazy: () => import('@/routes/admin/layout'),
						children: [
							{
								index: true,
								element: <RedirectToAdminHome />,
							},
							{
								path: 'my-content',
								element: <RedirectToAdminPathOrRender pathname="resources" element={<NoMatch />} />,
							},
							{
								path: 'my-content/create',
								element: <RedirectToAdminPathOrRender pathname="resources/add" element={<NoMatch />} />,
							},
							{
								path: 'available-content',
								element: <RedirectToAdminPathOrRender pathname="resources" element={<NoMatch />} />,
							},
							{
								path: 'resources',
								children: [
									{
										id: 'admin-resources',
										index: true,
										lazy: () => import('@/routes/admin/resources/resources'),
									},
									{
										id: 'admin-resource-form',
										path: ':action?/:contentId?',
										lazy: () => import('@/routes/admin/resources/resource-form'),
									},
								],
							},
							{
								path: 'group-sessions',
								children: [
									{
										id: 'admin-group-sessions',
										index: true,
										lazy: () => import('@/routes/admin/group-sessions/group-sessions'),
									},
									{
										id: 'admin-group-session-form',
										path: ':action?/:groupSessionId?',
										lazy: () => import('@/routes/admin/group-sessions/group-session-form'),
									},
								],
							},
							{
								id: 'admin-reports',
								path: 'reports',
								element: <Reports />,
							},
							{
								id: 'admin-scheduling',
								path: 'scheduling',
								element: <>TODO: Scheduling</>,
							},
							{
								id: 'admin-analytics-layout',
								path: 'analytics',
								lazy: () => import('@/routes/admin/analytics/layout'),
								children: [
									{
										index: true,
										element: <Navigate to="overview" />,
									},
									{
										id: 'admin-analytics-dashboard-tab',
										path: ':dashboardTab',
										lazy: () => import('@/routes/admin/analytics/dashboard-tab'),
									},
								],
							},
							{
								id: 'admin-debug',
								path: 'debug',
								element: <ToggledOutlet isEnabled={() => config.showDebug} />,
								children: [
									{
										index: true,
										element: <Navigate to="ui" />,
									},
									{
										id: 'admin-debug-ui',
										path: 'ui',
										lazy: () => import('@/routes/admin/debug/ui'),
									},
								],
							},
						],
					},
				],
			},
			{
				element: (
					<ToggledOutlet
						isEnabled={({ institution }) => {
							return institution.integratedCareEnabled;
						}}
					/>
				),
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
										id: 'mhic-patient-orders',
										path: 'patient-orders',
										lazy: () => import('@/routes/ic/mhic/patient-orders'),
										children: [mhicShelfRouteObject],
									},
									{
										id: 'mhic-order-assessment',
										path: 'order-assessment/:patientOrderId',
										lazy: () => import('@/routes/ic/mhic/order-layout'),
										children: [
											{
												index: true,
												element: <MhicOrderAssessment />,
											},
											{
												path: ':screeningQuestionContextId',
												element: <ScreeningQuestionsPage />,
												handle: {
													hideFooterContactUs: true,
												} as RouteHandle,
											},
										],
									},
									{
										id: 'department-availability',
										path: 'department-availability',
										lazy: () => import('@/routes/ic/mhic/department-availability'),
									},
									{
										id: 'reports',
										path: 'reports',
										lazy: () => import('@/routes/ic/mhic/reports'),
									},
									{
										path: 'connect-with-support/mhp',
										element: <ConnectWithSupportV2 />,
									},
									{
										path: '*',
										element: <NoMatch />,
									},
								],
							},
							{
								path: 'patient',
								lazy: () => import('@/routes/ic/patient/patient-layout'),
								children: [
									{
										id: 'patient-landing',
										index: true,
										lazy: () => import('@/routes/ic/patient/patient-landing'),
									},
									// {
									// 	path: 'consent',
									// 	element: <PatientConsent />,
									// },
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
										path: 'connect-with-support/mhp',
										element: <ConnectWithSupportV2 />,
									},
									{
										path: 'assessment/:screeningQuestionContextId',
										element: <ScreeningQuestionsPage />,
										handle: {
											hideFooterContactUs: true,
										} as RouteHandle,
									},
									{
										path: 'check-in',
										element: <PatientCheckIn />,
									},
									{
										path: 'confirm-appointment',
										element: <ConfirmAppointment />,
									},
									{
										path: '*',
										element: <NoMatch />,
									},
								],
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
];
