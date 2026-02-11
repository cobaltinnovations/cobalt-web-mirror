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

const toFiniteNumber = (value: unknown): number | undefined => {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const getCurrentTimeSeconds = (player: any): number | undefined => {
	if (!player) {
		return undefined;
	}

	if (typeof player.getCurrentTime === 'function') {
		return toFiniteNumber(player.getCurrentTime());
	}

	if (typeof player.currentTime === 'number') {
		return toFiniteNumber(player.currentTime);
	}

	if (typeof player.currentTime === 'function') {
		return toFiniteNumber(player.currentTime());
	}

	return undefined;
};

const getDurationSeconds = (player: any, mediaInfo?: unknown): number | undefined => {
	if (mediaInfo && typeof mediaInfo === 'object') {
		const mediaInfoRecord = mediaInfo as Record<string, unknown>;
		const mediaInfoDurationSeconds =
			toFiniteNumber(mediaInfoRecord.duration) ??
			toFiniteNumber(mediaInfoRecord.durationSeconds) ??
			(typeof mediaInfoRecord.msDuration === 'number'
				? toFiniteNumber(mediaInfoRecord.msDuration / 1000)
				: undefined) ??
			(typeof mediaInfoRecord.durationMs === 'number'
				? toFiniteNumber(mediaInfoRecord.durationMs / 1000)
				: undefined);
		if (typeof mediaInfoDurationSeconds === 'number') {
			return mediaInfoDurationSeconds;
		}
	}

	if (!player) {
		return undefined;
	}

	if (typeof player.getDuration === 'function') {
		const duration = toFiniteNumber(player.getDuration());
		if (typeof duration === 'number') {
			return duration;
		}
	}

	if (typeof player.duration === 'number') {
		return toFiniteNumber(player.duration);
	}

	return undefined;
};

const getIsPaused = (player: any): boolean | undefined => {
	if (!player) {
		return undefined;
	}

	if (typeof player.paused === 'boolean') {
		return player.paused;
	}

	if (typeof player.paused === 'function') {
		const paused = player.paused();
		return typeof paused === 'boolean' ? paused : undefined;
	}

	if (typeof player.isPaused === 'function') {
		const paused = player.isPaused();
		return typeof paused === 'boolean' ? paused : undefined;
	}

	return undefined;
};

const getPlaybackRate = (player: any): number | undefined => {
	if (!player) {
		return undefined;
	}

	if (typeof player.playbackRate === 'number') {
		return toFiniteNumber(player.playbackRate);
	}

	if (typeof player.getPlaybackRate === 'function') {
		return toFiniteNumber(player.getPlaybackRate());
	}

	return undefined;
};

export interface CourseVideoEventPlaybackTime {
	currentTimeSeconds?: number;
	currentTimeFloorSeconds?: number;
	durationSeconds?: number;
	percentComplete?: number;
	playbackRate?: number;
	isPaused?: boolean;
}

const getEventPlaybackTime = (player: any, mediaInfo?: unknown): CourseVideoEventPlaybackTime | undefined => {
	const currentTimeSeconds = getCurrentTimeSeconds(player);
	const durationSeconds = getDurationSeconds(player, mediaInfo);
	const playbackRate = getPlaybackRate(player);
	const isPaused = getIsPaused(player);

	const eventPlaybackTime: CourseVideoEventPlaybackTime = {
		...(typeof currentTimeSeconds === 'number' && {
			currentTimeSeconds,
			currentTimeFloorSeconds: Math.floor(currentTimeSeconds),
		}),
		...(typeof durationSeconds === 'number' && {
			durationSeconds,
		}),
		...(typeof playbackRate === 'number' && { playbackRate }),
		...(typeof isPaused === 'boolean' && { isPaused }),
	};

	if (typeof currentTimeSeconds === 'number' && typeof durationSeconds === 'number' && durationSeconds > 0) {
		const percentComplete = Math.min(100, Math.max(0, (currentTimeSeconds / durationSeconds) * 100));
		eventPlaybackTime.percentComplete = Math.round(percentComplete * 1000) / 1000;
	}

	return Object.keys(eventPlaybackTime).length > 0 ? eventPlaybackTime : undefined;
};

export const getKalturaScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
	errorCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (
		eventName: string,
		event: unknown,
		mediaInfo: unknown,
		playbackTime?: CourseVideoEventPlaybackTime
	) => void;
	errorCallback: (error: unknown) => void;
}) => {
	const script = document.createElement('script');
	script.src = `https://cdnapisec.kaltura.com/p/${courseVideo.kalturaPartnerId}/embedPlaykitJs/uiconf_id/${courseVideo.kalturaUiconfId}`;
	script.async = true;
	let player: any;
	let isDestroyed = false;
	let hasErrored = false;
	const eventThrottleDurationMs = 2500;
	const lastEventAtByName = new Map<string, number>();
	const unthrottledEventNames = new Set<string>([
		'play',
		'pause',
		'ended',
		'playing',
		'firstplay',
		'seeking',
		'seeked',
		'durationchange',
		'ratechange',
		'volumechange',
		'mute',
		'unmute',
		'fullscreenchange',
		'enterfullscreen',
		'exitfullscreen',
		'loadstart',
		'loadedmetadata',
		'loadeddata',
		'canplay',
		'canplaythrough',
		'waiting',
		'stalled',
		'abort',
		'emptied',
		'playerready',
		'ready',
		'mediaready',
		'playlistready',
		'playlistended',
		'playlistitemchanged',
		'playlistplaynext',
		'playlistplayprev',
		'playlistupdate',
		'castavailable',
		'castsessionstarted',
		'castsessionended',
		'adstarted',
		'adended',
		'adclicked',
		'adimpression',
		'adskippablestatechanged',
		'user_clicked_fullscreen_enter',
		'user_clicked_fullscreen_exit',
		'user_clicked_mute',
		'user_clicked_pause',
		'user_clicked_play',
		'user_clicked_seek',
		'user_clicked_unmute',
		'user_clicked_volume_change',
	]);
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
				const normalizedEventName = eventName.toLowerCase();
				if (!unthrottledEventNames.has(normalizedEventName)) {
					const now = Date.now();
					const lastEventAt = lastEventAtByName.get(normalizedEventName);
					if (lastEventAt && now - lastEventAt < eventThrottleDurationMs) {
						return;
					}

					lastEventAtByName.set(normalizedEventName, now);
				}

				const payload =
					event && typeof event === 'object' && 'payload' in (event as Record<string, unknown>)
						? (event as { payload?: unknown }).payload
						: event;

				const mediaInfo = getPlayerMediaInfo(playerInstance);
				const playbackTime = getEventPlaybackTime(playerInstance, mediaInfo);
				eventCallback(eventName, payload, mediaInfo, playbackTime);
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
