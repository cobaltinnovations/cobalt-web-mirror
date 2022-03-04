import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AccountModel,
	AppointmentModel,
	BetaFeature,
	BetaFeatureId,
	BetaStatusId,
	PersonalizationDetails,
} from '@/lib/models';
import { Institution } from '../models/institution';

export interface AccountResponse {
	account: AccountModel;
}

export type EpicMatchStep = 'STEP_1' | 'STEP_2' | 'STEP_3' | 'FINISH';

export interface EpicMatchRespone {
	topMatchScore: number;
	topMatchScoreDescription: string;
	topMatchPercentage: number; // between 0 and 1, used for progressbar
	topMatchPercentageDescription: string;
	topMatchConfidence: string;
	topMatchConfidenceDescription: string;
	matchCount: number; // if we have 2 or more matches that meet threshold, that triggers the "multiple matches" failure mode
	matchCountDescription: string;
	matchScoreThreshold: number;
	matchScoreThresholdDescription: string;
	appliedToCurrentAccount: boolean;
	account: AccountModel; // if appliedToCurrentAccount is true then we'll have the new account
}

export interface AccountWithTokenResponse extends AccountResponse {
	accessToken: string;
	destinationUrl?: string;
}

export interface AccountWithInstitutionResponse extends AccountResponse {
	institution: Institution;
}

export interface UpdateEmailAddressForAccountIdData {
	emailAddress: string;
}

export interface UpdatePhoneNumberForAccountIdData {
	phoneNumber: string;
}

export interface RequestAccessTokenData {
	emailAddress: string;
	password: string;
}

export interface EpicPatientData {
	firstName: string;
	lastName: string;
	middleInitial: string;
	dateOfBirth: string;
	address: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	};
	emailAddress: string;
	phoneNumber: string;
	phoneType?: 'MOBILE' | 'HOME';
	nationalIdentifier: string;
	gender?: 'MALE' | 'FEMALE';
}

export interface CreateAnonymousAccountRequestBody {
	subdomain?: string;
}

export interface InviteAccountRequestBody {
	subdomain: string;
	accountSourceId: string;
	emailAddress: string;
	password: string;
}

export interface ResetPasswordRequestBody {
	passwordResetToken: string;
	password: string;
	confirmPassword: string;
}

export const accountService = {
	account(accountId: string) {
		return httpSingleton.orchestrateRequest<AccountWithInstitutionResponse>({
			method: 'get',
			url: `/accounts/${accountId}?supplements=CAPABILITIES`,
		});
	},
	createAnonymousAccount(data?: CreateAnonymousAccountRequestBody) {
		return httpSingleton.orchestrateRequest<AccountWithTokenResponse>({
			method: 'post',
			url: '/accounts',
			data,
		});
	},
	updateEmailAddressForAccountId(accountId: string, data: UpdateEmailAddressForAccountIdData) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'put',
			url: `/accounts/${accountId}/email-address`,
			data,
		});
	},
	updatePhoneNumberForAccountId(accountId: string, data: UpdatePhoneNumberForAccountIdData) {
		return httpSingleton.orchestrateRequest<AccountResponse>({
			method: 'put',
			url: `/accounts/${accountId}/phone-number`,
			data,
		});
	},
	getAccountSession(accountSessionId: string) {
		return httpSingleton.orchestrateRequest<string>({
			method: 'get',
			url: `/account-sessions/${accountSessionId}/text`,
		});
	},
	getAccessToken(data: RequestAccessTokenData) {
		return httpSingleton.orchestrateRequest<AccountWithTokenResponse>({
			method: 'post',
			url: 'accounts/access-token',
			data,
		});
	},
	epicMatch(
		matchStep: EpicMatchStep,
		data: Partial<EpicPatientData>,
		{
			providerId,
			epicDepartmentId,
			applyToCurrentAccount = false,
		}: { providerId: string; epicDepartmentId: string; applyToCurrentAccount: boolean }
	) {
		return httpSingleton.orchestrateRequest<EpicMatchRespone>({
			method: 'post',
			url: `/epic/patient-match`,
			data: {
				matchStep,
				applyToCurrentAccount,
				providerId,
				epicDepartmentId,
				...data,
			},
		});
	},
	inviteAccount(data: InviteAccountRequestBody) {
		return httpSingleton.orchestrateRequest<{ accountInviteId: string }>({
			method: 'post',
			url: '/accounts/invite',
			data,
		});
	},
	claimInvite(accountInviteId: string) {
		return httpSingleton.orchestrateRequest<{ inviteExpired: boolean }>({
			method: 'put',
			url: `/accounts/claim-invite/${accountInviteId}`,
		});
	},
	resendInvite(accountInviteId: string) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: `/accounts/resend-invite/${accountInviteId}`,
		});
	},
	sendForgotPasswordEmail(emailAddress: string) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: 'accounts/forgot-password',
			data: { emailAddress },
		});
	},
	resetPassword(data: ResetPasswordRequestBody) {
		return httpSingleton.orchestrateRequest({
			method: 'post',
			url: '/accounts/reset-password',
			data,
		});
	},
	getBetaFeatures(accountId: string) {
		return httpSingleton.orchestrateRequest<{ betaFeatureAlerts: BetaFeature[] }>({
			method: 'get',
			url: `/accounts/${accountId}/beta-feature-alerts`,
		});
	},
	updateBetaFeatureAlert(accountId: string, betaFeatureId: BetaFeatureId, betaFeatureAlertStatusId: BetaStatusId) {
		return httpSingleton.orchestrateRequest<{ betaFeature: BetaFeature }>({
			method: 'put',
			url: `/accounts/${accountId}/beta-feature-alerts`,
			data: {
				betaFeatureId,
				betaFeatureAlertStatusId,
			},
		});
	},
	updateBetaStatus(accountId: string, betaStatusId: BetaStatusId) {
		return httpSingleton.orchestrateRequest<{ betaStatusId: BetaStatusId }>({
			method: 'put',
			url: `/accounts/${accountId}/beta-status`,
			data: { betaStatusId },
		});
	},
	getAppointmentDetailsForAccount(accountId: string, appointmentId: string) {
		return httpSingleton.orchestrateRequest<{
			account: AccountModel;
			appointment: AppointmentModel;
			appointments: AppointmentModel[];
			assessment: PersonalizationDetails;
		}>({
			method: 'GET',
			url: `/accounts/${accountId}/appointment-details/${appointmentId}`,
		});
	},
	postRoleRequest(accountId: string, roleId: string) {
		return httpSingleton.orchestrateRequest<unknown>({
			method: 'POST',
			url: `/accounts/${accountId}/role-request`,
			data: { roleId },
		});
	},
};
