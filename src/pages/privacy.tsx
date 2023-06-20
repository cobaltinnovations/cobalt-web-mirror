import React, { FC } from 'react';
import { Helmet } from 'react-helmet';

import { PrivacyContent } from '@/components/privacy-content';

const Privacy: FC = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | Privacy Policy</title>
			</Helmet>

			<PrivacyContent />
		</>
	);
};

export default Privacy;
