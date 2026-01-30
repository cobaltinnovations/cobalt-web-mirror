import {
	CourseModuleModel,
	CourseSessionModel,
	CourseSessionUnitStatusId,
	CourseUnitLockTypeId,
	CourseUnitModel,
	CourseVideoModel,
} from '@/lib/models';

export const getRequiredCourseModules = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	return courseModules.filter((cm) => !optionalCourseModuleIds.includes(cm.courseModuleId));
};

export const getOptionalCourseModules = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	return courseModules.filter((cm) => optionalCourseModuleIds.includes(cm.courseModuleId));
};

export const getRequiredCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const requiredModules = getRequiredCourseModules(courseModules, optionalCourseModuleIds);
	return requiredModules.flatMap((cm) => cm.courseUnits);
};

export const getOptionalCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const optionalModules = getOptionalCourseModules(courseModules, optionalCourseModuleIds);
	return optionalModules.flatMap((cm) => cm.courseUnits);
};

export const getOrderedCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const requiredCourseUnits = getRequiredCourseUnits(courseModules, optionalCourseModuleIds);
	const optionalCourseUnits = getOptionalCourseUnits(courseModules, optionalCourseModuleIds);
	return [...requiredCourseUnits, ...optionalCourseUnits];
};

export const getCompletedCourseUnitIds = (courseSession: CourseSessionModel) => {
	return Object.entries(courseSession.courseSessionUnitStatusIdsByCourseUnitId)
		.filter(([, status]) => status === CourseSessionUnitStatusId.COMPLETED)
		.map(([courseUnitId]) => courseUnitId);
};

export const getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession = (
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const courseUnitsOrdered = getOrderedCourseUnits(courseModules, courseSession.optionalCourseModuleIds);
	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([, { courseUnitLockTypeId }]) => courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED)
		.map(([courseUnitId]) => courseUnitId);
	const completedCourseUnitIds = getCompletedCourseUnitIds(courseSession);
	const nextCourseUnit = courseUnitsOrdered.find(
		(u) => unlockedCourseUnitIds.includes(u.courseUnitId) && !completedCourseUnitIds.includes(u.courseUnitId)
	);

	return nextCourseUnit?.courseUnitId;
};

export const getNextUnit = (
	courseUnit: CourseUnitModel,
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const courseUnitsOrdered = getOrderedCourseUnits(courseModules, courseSession.optionalCourseModuleIds);
	const currentCourseUnitIndex = courseUnitsOrdered.findIndex((cu) => cu.courseUnitId === courseUnit.courseUnitId);

	if (currentCourseUnitIndex === -1) return undefined;

	const preCurrentCourseUnits = courseUnitsOrdered.slice(0, currentCourseUnitIndex);
	const postCurrentCourseUnits = courseUnitsOrdered.slice(currentCourseUnitIndex + 1);
	const desiredUnits = postCurrentCourseUnits.length > 0 ? postCurrentCourseUnits : preCurrentCourseUnits;

	const nextCourseUnit = desiredUnits[0];
	return nextCourseUnit?.courseUnitId;
};

export const getCurrentCourseModule = (courseModules: CourseModuleModel[], courseSession?: CourseSessionModel) => {
	if (!courseSession) {
		return courseModules[0];
	}

	const currentCourseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(courseModules, courseSession);

	return courseModules.find((cm) =>
		cm.courseUnits.map((u) => u.courseUnitId).find((uid) => uid === currentCourseUnitId)
	);
};

const getKalturaEventNames = (kalturaPlayer: any, player: any) => {
	const eventNames = new Set<string>();

	const addEventEnum = (eventEnum: unknown) => {
		if (!eventEnum || typeof eventEnum !== 'object') {
			return;
		}

		for (const value of Object.values(eventEnum)) {
			if (typeof value === 'string') {
				eventNames.add(value);
			}
		}
	};

	const addEventRoot = (eventRoot: unknown) => {
		if (!eventRoot || typeof eventRoot !== 'object') {
			return;
		}

		addEventEnum(eventRoot);

		for (const value of Object.values(eventRoot as Record<string, unknown>)) {
			if (value && typeof value === 'object') {
				addEventEnum(value);
			}
		}
	};

	addEventRoot(player?.Event);
	addEventRoot(kalturaPlayer?.Event);
	addEventEnum(kalturaPlayer?.playlist?.PlaylistEventType);
	addEventEnum(player?.playlist?.PlaylistEventType);

	return [...eventNames];
};

const getPlayerMediaInfo = (player: any) => {
	if (!player || typeof player.getMediaInfo !== 'function') {
		return undefined;
	}

	try {
		return player.getMediaInfo();
	} catch (error) {
		return undefined;
	}
};

export const getKalturaScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
	errorCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (eventName: string, event: unknown, mediaInfo: unknown) => void;
	errorCallback: (error: unknown) => void;
}) => {
	const script = document.createElement('script');
	script.src = `https://cdnapisec.kaltura.com/p/${courseVideo.kalturaPartnerId}/embedPlaykitJs/uiconf_id/${courseVideo.kalturaUiconfId}`;
	script.async = true;
	let player: any;
	let isDestroyed = false;
	let hasErrored = false;
	const teardownHandlers: Array<() => void> = [];

	let readyResolve: (playerInstance: any) => void = () => {};
	let readyReject: (error: unknown) => void = () => {};
	const readyPromise = new Promise<any>((resolve, reject) => {
		readyResolve = resolve;
		readyReject = reject;
	});

	const handleError = (error: unknown) => {
		if (hasErrored) {
			return;
		}

		hasErrored = true;
		errorCallback(error);
		readyReject(error);
	};

	const registerEvents = (playerInstance: any, kalturaPlayer: any) => {
		const eventNames = getKalturaEventNames(kalturaPlayer, playerInstance);

		for (const eventName of eventNames) {
			const handler = (event: { payload?: unknown } | unknown) => {
				const payload =
					event && typeof event === 'object' && 'payload' in (event as Record<string, unknown>)
						? (event as { payload?: unknown }).payload
						: event;

				eventCallback(eventName, payload, getPlayerMediaInfo(playerInstance));
			};

			playerInstance.addEventListener(eventName, handler);
			teardownHandlers.push(() => playerInstance.removeEventListener(eventName, handler));
		}
	};

	const initializePlayer = () => {
		if (isDestroyed) {
			return;
		}

		try {
			const kalturaPlayer = (window as Window & { KalturaPlayer?: any }).KalturaPlayer;
			if (!kalturaPlayer?.setup) {
				handleError(new Error('KalturaPlayer not available'));
				return;
			}

			player = kalturaPlayer.setup({
				targetId: videoPlayerId,
				provider: {
					partnerId: courseVideo.kalturaPartnerId,
					uiConfId: courseVideo.kalturaUiconfId,
				},
			});

			registerEvents(player, kalturaPlayer);

			const hasPlaylistId = !!courseVideo.kalturaPlaylistId;
			const hasEntryId = !!courseVideo.kalturaEntryId;

			if (!hasPlaylistId && !hasEntryId) {
				handleError(new Error('Missing Kaltura entry or playlist id'));
				return;
			}

			let loadPromise: unknown;
			if (hasPlaylistId && !hasEntryId) {
				if (typeof player.loadPlaylist !== 'function') {
					handleError(new Error('Kaltura playlist support is not available'));
					return;
				}

				loadPromise = player.loadPlaylist({ playlistId: courseVideo.kalturaPlaylistId });
			} else {
				if (typeof player.loadMedia !== 'function') {
					handleError(new Error('Kaltura media loading is not available'));
					return;
				}

				loadPromise = player.loadMedia({ entryId: courseVideo.kalturaEntryId });
			}

			Promise.resolve(loadPromise)
				.then(() => (typeof player.ready === 'function' ? player.ready() : undefined))
				.then(() => readyResolve(player))
				.catch((error) => {
					handleError(error);
				});
		} catch (error) {
			handleError(error);
		}
	};

	script.onload = initializePlayer;
	script.onerror = handleError;

	return {
		script,
		ready: () => readyPromise,
		getPlayer: () => player,
		destroy: () => {
			isDestroyed = true;
			teardownHandlers.forEach((handler) => handler());
			teardownHandlers.length = 0;
			if (player?.destroy) {
				player.destroy();
			}
		},
	};
};
