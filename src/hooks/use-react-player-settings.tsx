import { useEffect, useMemo, useState } from 'react';
import ReactPlayer, { Config } from 'react-player';

function useReactPlayerSettings(contentUrl?: string) {
	const [canEmbed, setCanEmbed] = useState(false);

	useEffect(() => {
		if (!contentUrl) {
			setCanEmbed(false);
			return;
		}

		setCanEmbed(ReactPlayer.canPlay(contentUrl));
	}, [contentUrl]);

	const embedUrl = useMemo(() => {
		if (!contentUrl || !canEmbed) {
			return;
		}

		return new URL(contentUrl);
	}, [canEmbed, contentUrl]);

	const playerConfig: Config = useMemo(() => {
		return {
			youtube: {
				playerVars: {
					index: embedUrl?.searchParams?.get('index'),
				},
			},
		};
	}, [embedUrl?.searchParams]);

	return {
		canEmbed,
		embedUrl: embedUrl?.toString(),
		playerConfig,
	};
}

export default useReactPlayerSettings;
