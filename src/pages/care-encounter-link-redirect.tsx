import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { config } from '@/config';

const CareEncounterLinkRedirect = () => {
	const { linkId } = useParams<{ linkId: string }>();

	useEffect(() => {
		if (linkId) {
			window.location.replace(`${config.apiBaseUrl.replace(/\/$/, '')}/care-encounter-links/${linkId}/redirect`);
		}
	}, [linkId]);

	return null;
};

export default CareEncounterLinkRedirect;
