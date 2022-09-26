import Cookies from 'js-cookie';
import React, { PropsWithChildren, useEffect, useState } from 'react';

import useAccount from '@/hooks/use-account';
import Loader from './loader';

const PrivateRoute = ({ children }: PropsWithChildren) => {
	const { initialized, account } = useAccount();
	const [canRender, setCanRender] = useState(false);

	useEffect(() => {
		setCanRender(initialized && !!account);
	}, [account, initialized]);

	return <>{canRender ? children : <Loader />}</>;
};

export default PrivateRoute;
