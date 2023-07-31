import { lazy } from 'react';

const chunkloadRefreshKey = 'ChunkLoadError-refresh';

export function lazyLoadWithRefresh(componentImport: Parameters<typeof lazy>[0]) {
	return lazy(async () => {
		const pageHasAlreadyBeenForceRefreshed = JSON.parse(
			window.localStorage.getItem(chunkloadRefreshKey) || 'false'
		);

		try {
			const component = await componentImport();

			window.localStorage.setItem(chunkloadRefreshKey, 'false');

			return component;
		} catch (error) {
			if (error instanceof Error && error.name === 'ChunkLoadError' && !pageHasAlreadyBeenForceRefreshed) {
				window.localStorage.setItem(chunkloadRefreshKey, 'true');
				window.location.reload();

				return {
					default: () => null,
				};
			}

			throw error;
		}
	});
}
