import React, { ReactNode, useEffect } from 'react';
import { SignInCobaltProps } from '@/components/auth/sign-in-cobalt';
import { SignInPatient } from '@/components/auth/sign-in-patient';
import { SignInStaff } from '@/components/auth/sign-in-staff';
import useAccount from '@/hooks/use-account';
import { AnalyticsNativeEventTypeId } from '@/lib/models';
import { analyticsService } from '@/lib/services';
import useAccountSourceClickHandler from '@/hooks/use-account-source-click-handler';

interface SignInShellProps {
	defaultView(signInProps: SignInCobaltProps): ReactNode;
}

export const SignInShell = ({ defaultView }: SignInShellProps) => {
	const { isIntegratedCarePatient, isIntegratedCareStaff } = useAccount();
	const handleAccountSourceClick = useAccountSourceClickHandler();

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_SIGN_IN);
	}, []);

	const signInProps: SignInCobaltProps = {
		onAccountSourceClick: handleAccountSourceClick,
	};

	if (isIntegratedCarePatient) {
		return <SignInPatient {...signInProps} />;
	} else if (isIntegratedCareStaff) {
		return <SignInStaff {...signInProps} />;
	}

	return <>{defaultView(signInProps)}</>;
};
