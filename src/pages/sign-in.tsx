import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignInCobalt, SignInCobaltProps } from '@/components/auth/sign-in-cobalt';
import { SignInPatient } from '@/components/auth/sign-in-patient';
import { SignInStaff } from '@/components/auth/sign-in-staff';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useSubdomain from '@/hooks/use-subdomain';
import config from '@/lib/config';
import { AccountSource, AccountSourceId, UserExperienceTypeId } from '@/lib/models';
import { accountService } from '@/lib/services';

const SignIn: FC = () => {
	const handleError = useHandleError();
	const { institution, processAccessToken } = useAccount();
	const subdomain = useSubdomain();
	const navigate = useNavigate();

	const handleEnterAnonymouslyButtonClick = useCallback(async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					...(subdomain && { subdomain }),
				})
				.fetch();

			processAccessToken(accessToken);
		} catch (error) {
			handleError(error);
		}
	}, [handleError, processAccessToken, subdomain]);

	const handleAccountSourceClick = useCallback(
		async (accountSource: AccountSource) => {
			if (accountSource.accountSourceId === AccountSourceId.ANONYMOUS) {
				handleEnterAnonymouslyButtonClick();
			} else if (accountSource.accountSourceId === AccountSourceId.EMAIL_PASSWORD) {
				navigate('/sign-in/email');
			} else if (accountSource.accountSourceId === AccountSourceId.MYCHART) {
				const mychartUrl = new URL(config.COBALT_WEB_API_BASE_URL);
				mychartUrl.pathname = `/institutions/${institution?.institutionId}/mychart-authentication-url`;
				mychartUrl.search = `redirectImmediately=true`;

				window.location.href = mychartUrl.toString();
			} else if (accountSource.ssoUrl) {
				window.location.href = accountSource.ssoUrl;
			}
		},
		[handleEnterAnonymouslyButtonClick, institution?.institutionId, navigate]
	);

	const signInProps: SignInCobaltProps = {
		onAccountSourceClick: handleAccountSourceClick,
	};

	if (institution?.integratedCareEnabled) {
		if (institution?.userExperienceTypeId === UserExperienceTypeId.PATIENT) {
			return <SignInPatient {...signInProps} />;
		} else if (institution?.userExperienceTypeId === UserExperienceTypeId.STAFF) {
			return <SignInStaff {...signInProps} />;
		}
	}

	return <SignInCobalt {...signInProps} />;
};

export default SignIn;
