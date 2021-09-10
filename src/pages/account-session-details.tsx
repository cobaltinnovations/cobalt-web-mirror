import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { accountService } from '@/lib/services';

const AccountSessionDetails = () => {
	const match = useRouteMatch<{ accountSessionId: string }>();
	const accountSessionId = match.params.accountSessionId;

	const [text, setText] = useState('');

	useEffect(() => {
		const req = accountService.getAccountSession(accountSessionId);
		req.fetch().then((response) => {
			setText(response);
		});
	}, [accountSessionId]);

	return <p className="m-6" style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: text }} />;
};

export default AccountSessionDetails;
