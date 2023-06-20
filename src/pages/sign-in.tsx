import React, { FC } from 'react';
import { Helmet } from 'react-helmet';

import { SignInCobalt } from '@/components/auth/sign-in-cobalt';
import { SignInShell } from '@/components/auth/sign-in-shell';

const SignIn: FC = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | Sign In</title>
			</Helmet>

			<SignInShell defaultView={(signInProps) => <SignInCobalt {...signInProps} />} />
		</>
	);
};

export default SignIn;
