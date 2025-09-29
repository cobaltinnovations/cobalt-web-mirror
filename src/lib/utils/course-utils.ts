import {
	CourseModuleModel,
	CourseSessionModel,
	CourseSessionUnitStatusId,
	CourseUnitLockTypeId,
	CourseUnitModel,
	CourseVideoModel,
	MediaEntry,
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

export const isLastUnit = (
	courseUnit: CourseUnitModel,
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const courseUnitsOrdered = getOrderedCourseUnits(courseModules, courseSession.optionalCourseModuleIds);
	const isLastUnit = courseUnit.courseUnitId === courseUnitsOrdered[courseUnitsOrdered.length - 1].courseUnitId;
	return isLastUnit;
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

export const getKalturaScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
	errorCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (eventName: string, event: string | number | object, mediaProxy: MediaEntry) => void;
	errorCallback: (error: unknown) => void;
}) => {
	const script = document.createElement('script');
	script.src = `//cdnapisec.kaltura.com/p/${courseVideo.kalturaPartnerId}/sp/${courseVideo.kalturaPartnerId}00/embedIframeJs/uiconf_id/${courseVideo.kalturaUiconfId}/partner_id/${courseVideo.kalturaPartnerId}`;
	script.async = true;
	script.onload = () => {
		// @ts-ignore
		window.kWidget.embed({
			targetId: videoPlayerId,
			wid: courseVideo.kalturaWid,
			uiconf_id: courseVideo.kalturaUiconfId,
			...(courseVideo.kalturaEntryId && { entry_id: courseVideo.kalturaEntryId }),
			...(courseVideo.kalturaPlaylistId && {
				flashvars: {
					playlistAPI: {
						plugin: true,
						includeInLayout: true,
						autoPlay: false,
						autoInsert: true,
						layout: 'vertical',
						kpl0Name: '',
						kpl0Id: courseVideo.kalturaPlaylistId,
					},
				},
			}),
			readyCallback: (playerID: string) => {
				const kdp = document.getElementById(playerID);
				const events = [
					'adClicked',
					'adEnded',
					'adImpression',
					'adSkippableStateChanged',
					'adStarted',
					'bufferChange',
					'closeFullScreen',
					'cuePointReached',
					'customEvent',
					'firstPlay',
					'HTML5_video_durationchange',
					'HTML5_video_ended',
					'HTML5_video_error',
					'HTML5_video_loadeddata',
					'HTML5_video_loadedmetadata',
					'HTML5_video_pause',
					'HTML5_video_playing',
					'HTML5_video_progress',
					'HTML5_video_ratechange',
					'HTML5_video_seeked',
					'HTML5_video_stalled',
					'HTML5_video_timeupdate',
					'layoutBuildDone',
					'mediaError',
					'mediaLoaded',
					'mediaReady',
					'mute',
					'onChangeMedia',
					'onChangeMediaDone',
					'openFullScreen',
					'playerPaused',
					'playerPlayed',
					'playerPlayEnd',
					'playerReady',
					'playerStateChange',
					'playerUpdatePlayhead',
					'playlistEnded',
					'playlistItemChanged',
					'playlistPlayNext',
					'playlistPlayPrev',
					'playlistReady',
					'playlistUpdate',
					'preSeek',
					'seek',
					'seeked',
					'tracksChanged',
					'unmute',
					'USER_CLICKED_FULLSCREEN_ENTER',
					'USER_CLICKED_FULLSCREEN_EXIT',
					'USER_CLICKED_MUTE',
					'USER_CLICKED_PAUSE',
					'USER_CLICKED_PLAY',
					'USER_CLICKED_SEEK',
					'USER_CLICKED_UNMUTE',
					'USER_CLICKED_VOLUME_CHANGE',
					'volumeChanged',
				];

				for (let i = 0; i < events.length; i++) {
					if (!kdp) {
						return;
					}

					// @ts-ignore
					kdp.kBind(events[i], (event: string | number | object) => {
						// @ts-ignore
						eventCallback(events[i], event, kdp.evaluate('{mediaProxy.entry}'));
					});
				}
			},
		});
	};
	script.onerror = errorCallback;

	return {
		script,
	};
};
