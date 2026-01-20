import React, { FC } from 'react';
import { Helmet } from '@/components/helmet';

import { SignInCobalt } from '@/components/auth/sign-in-cobalt';
import { SignInShell } from '@/components/auth/sign-in-shell';
import useAccount from '@/hooks/use-account';

const SignIn: FC = () => {
	const { institution } = useAccount();
	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Sign In</title>
			</Helmet>

			<SignInShell defaultView={(signInProps) => <SignInCobalt {...signInProps} />} />
		</>
	);
};

export default SignIn;
