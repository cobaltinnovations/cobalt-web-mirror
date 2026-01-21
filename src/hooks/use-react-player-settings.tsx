import { useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import ReactPlayer from 'react-player';

type ReactPlayerConfig = NonNullable<ComponentProps<typeof ReactPlayer>['config']>;

function useReactPlayerSettings(contentUrl?: string) {
	const [canEmbed, setCanEmbed] = useState(false);

	useEffect(() => {
		if (!contentUrl) {
			setCanEmbed(false);
			return;
		}

		setCanEmbed(ReactPlayer.canPlay?.(contentUrl) ?? false);
	}, [contentUrl]);

	const embedUrl = useMemo(() => {
		if (!contentUrl || !canEmbed) {
			return;
		}

		return new URL(contentUrl);
	}, [canEmbed, contentUrl]);

	const playerConfig: ReactPlayerConfig = useMemo(() => {
		return {};
	}, []);

	return {
		canEmbed,
		embedUrl: embedUrl?.toString(),
		playerConfig,
	};
}

export default useReactPlayerSettings;
