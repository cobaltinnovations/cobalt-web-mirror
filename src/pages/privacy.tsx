import React, { FC } from 'react';
import { Helmet } from '@/components/helmet';

import { PrivacyContent } from '@/components/privacy-content';
import useAccount from '@/hooks/use-account';

const Privacy: FC = () => {
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Privacy Policy</title>
			</Helmet>

			<PrivacyContent />
		</>
	);
};

export default Privacy;
