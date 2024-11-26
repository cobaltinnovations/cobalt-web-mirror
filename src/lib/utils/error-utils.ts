import { lazy } from 'react';
import { Tag, TagGroup } from '../models';
import { config } from '@/config';

export function clearChunkLoadErrorStorage() {
	window.localStorage.removeItem(config.storageKeys.chunkloadRefreshKey);
}

export function checkShouldRefreshChunkLoadError(error: unknown) {
	const pageHasAlreadyBeenForceRefreshed = JSON.parse(
		window.localStorage.getItem(config.storageKeys.chunkloadRefreshKey) || 'false'
	);

	return error instanceof Error && error.name === 'ChunkLoadError' && !pageHasAlreadyBeenForceRefreshed;
}

export function handleChunkLoadError() {
	window.localStorage.setItem(config.storageKeys.chunkloadRefreshKey, 'true');
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

export const getTagGroupErrorMessage = (
	selectedTagGroupIds: string[],
	selectedTags: Tag[],
	tagGroupOptions: TagGroup[]
) => {
	const tagGroupMessages: string[] = [];
	selectedTagGroupIds.forEach((tgid) => {
		const currentTagGroup = tagGroupOptions.find((tg) => tg.tagGroupId === tgid);

		if (!currentTagGroup) {
			return;
		}

		const currentTagGroupHasSelections = selectedTags.some((t) => t.tagGroupId === tgid);
		if (!currentTagGroupHasSelections) {
			tagGroupMessages.push(
				`The tag category "${currentTagGroup.name}" is selected, but no tags in that category were chosen. Please unselect "${currentTagGroup.name}" or choose appropriate tags in that category.`
			);
		}
	});

	if (tagGroupMessages.length > 0) {
		return tagGroupMessages.join('\n');
	}

	return '';
};
