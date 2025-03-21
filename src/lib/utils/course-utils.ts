import { CourseSessionModel, CourseUnitLockTypeId, CourseVideoModel } from '../models';

export const getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession = (courseSession: CourseSessionModel) => {
	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([_k, v]) => v.courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED)
		.map(([k, _v]) => k);
	const completedCourseUnitIds = Object.keys(courseSession.courseSessionUnitStatusIdsByCourseUnitId);
	const unlockedAndIncompleteUnitIds = unlockedCourseUnitIds.filter((uid) => !completedCourseUnitIds.includes(uid));
	const firstUnlockedAndIncompleteCourseUnitId = unlockedAndIncompleteUnitIds[0];

	if (firstUnlockedAndIncompleteCourseUnitId) {
		return firstUnlockedAndIncompleteCourseUnitId;
	}

	return '';
};

export const getKulteraScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (eventName: string, event: string | number | object) => void;
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

	return {
		script,
	};
};
