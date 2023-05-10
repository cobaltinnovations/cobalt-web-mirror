import React, { FC } from 'react';

import { SignInCobalt } from '@/components/auth/sign-in-cobalt';
import { SignInShell } from '@/components/auth/sign-in-shell';

const SignIn: FC = () => {
	return <SignInShell defaultView={(signInProps) => <SignInCobalt {...signInProps} />} />;
};

export default SignIn;
