import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountService } from '@/lib/services';
import { Helmet } from 'react-helmet';
import { WysiwygDisplay } from '@/components/admin-cms/wysiwyg';

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

	return (
		<>
			<Helmet>
				<title>Cobalt | Session Details</title>
			</Helmet>

			<WysiwygDisplay className="m-6" html={text} />
		</>
	);
};

export default AccountSessionDetails;
