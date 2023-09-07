import { lazy } from 'react';

const chunkloadRefreshKey = 'ChunkLoadError-refresh';

export function clearChunkLoadErrorStorage() {
	window.localStorage.removeItem(chunkloadRefreshKey);
}

export function checkShouldRefreshChunkLoadError(error: unknown) {
	const pageHasAlreadyBeenForceRefreshed = JSON.parse(window.localStorage.getItem(chunkloadRefreshKey) || 'false');

	return error instanceof Error && error.name === 'ChunkLoadError' && !pageHasAlreadyBeenForceRefreshed;
}

export function handleChunkLoadError() {
	window.localStorage.setItem(chunkloadRefreshKey, 'true');
	window.location.reload();
}

export function lazyLoadWithRefresh(componentImport: Parameters<typeof lazy>[0]) {
	return lazy(async () => {
		try {
			const component = await componentImport();

			return component;
		} catch (error) {
			const shouldHandle = checkShouldRefreshChunkLoadError(error);

			if (shouldHandle) {
				handleChunkLoadError();
			}

			throw error;
		}
	});
}
