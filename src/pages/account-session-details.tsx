import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountService } from '@/lib/services';

const AccountSessionDetails = () => {
	const params = useParams<{ accountSessionId: string }>();
	const accountSessionId = params?.accountSessionId;

	const [text, setText] = useState('');

	useEffect(() => {
		if (!accountSessionId) {
			return;
		}

		const req = accountService.getAccountSession(accountSessionId);
		req.fetch().then((response) => {
			setText(response);
		});

		return () => {
			req.abort();
		};
	}, [accountSessionId]);

	return <p className="m-6" style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: text }} />;
};

export default AccountSessionDetails;
