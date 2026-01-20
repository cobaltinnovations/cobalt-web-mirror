import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { accountService } from '@/lib/services';
import { Helmet } from '@/components/helmet';
import useAccount from '@/hooks/use-account';

const AccountSessionDetails = () => {
	const params = useParams<{ accountSessionId: string }>();
	const accountSessionId = params?.accountSessionId;
	const { institution } = useAccount();

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
				<title>{institution.platformName ?? 'Cobalt'} | Session Details</title>
			</Helmet>

			<div
				className="m-6 wysiwyg-display"
				style={{ whiteSpace: 'pre-line' }}
				dangerouslySetInnerHTML={{ __html: text }}
			/>
		</>
	);
};

export default AccountSessionDetails;
