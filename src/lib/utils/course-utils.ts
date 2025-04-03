import { CourseModuleModel, CourseSessionModel, CourseUnitLockTypeId, CourseVideoModel } from '@/lib/models';

export const getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession = (
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const requiredModules = courseModules.filter(
		(cm) => !(courseSession.optionalCourseModuleIds ?? []).includes(cm.courseModuleId)
	);
	const optionalModules = courseModules.filter((cm) =>
		(courseSession.optionalCourseModuleIds ?? []).includes(cm.courseModuleId)
	);
	const requiredCourseUnits = requiredModules.map((courseModule) => courseModule.courseUnits).flat();
	const optionalCourseUnits = optionalModules.map((courseModule) => courseModule.courseUnits).flat();
	const courseUnits = [...requiredCourseUnits, ...optionalCourseUnits];

	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([_k, v]) => v.courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED)
		.map(([k, _v]) => k);
	const completedCourseUnitIds = Object.keys(courseSession.courseSessionUnitStatusIdsByCourseUnitId);
	const unlockedCourseUnits = courseUnits.filter((courseUnit) =>
		unlockedCourseUnitIds.includes(courseUnit.courseUnitId)
	);
	const unlockedAndIncompleteUnits = unlockedCourseUnits.filter(
		(courseUnit) => !completedCourseUnitIds.includes(courseUnit.courseUnitId)
	);
	const firstUnlockedAndIncompleteCourseUnit = unlockedAndIncompleteUnits[0];

	if (firstUnlockedAndIncompleteCourseUnit) {
		return firstUnlockedAndIncompleteCourseUnit.courseUnitId;
	}

	return undefined;
};

export const getKalturaScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
	errorCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (eventName: string, event: string | number | object) => void;
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
			entry_id: courseVideo.kalturaEntryId,
			readyCallback: (playerID: string) => {
				const kdp = document.getElementById(playerID);
				const events = [
					'layoutBuildDone',
					'playerReady',
					'mediaLoaded',
					'mediaError',
					'playerStateChange',
					'firstPlay',
					'playerPlayed',
					'playerPaused',
					'preSeek',
					'seek',
					'seeked',
					'playerUpdatePlayhead',
					'openFullScreen',
					'closeFullScreen',
					'volumeChanged',
					'mute',
					'unmute',
					'bufferChange',
					'cuePointReached',
					'playerPlayEnd',
					'onChangeMedia',
					'onChangeMediaDone',
				];

				for (let i = 0; i < events.length; i++) {
					if (!kdp) return;

					// @ts-ignore
					kdp.kBind(events[i], (event: string | number | object) => {
						eventCallback(events[i], event);
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
