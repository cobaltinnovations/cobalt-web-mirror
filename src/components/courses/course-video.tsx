import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CourseVideoEventPlaybackTime, getKalturaScriptForVideo } from '@/lib/utils';
import classNames from 'classnames';
import { CourseVideoModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import InlineAlert from '@/components/inline-alert';
import Loader from '@/components/loader';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	videoPlayerSupplementsOuter: {
		position: 'relative',
	},
	videoPlayerLoader: {
		top: '50%',
		left: '50%',
	},
	videoPlayerOuter: {
		width: '100%',
		borderRadius: 8,
		overflow: 'hidden',
		aspectRatio: '16/9',
		backgroundColor: theme.colors.n900,
		'& #kaltura_player': {
			opacity: 0,
		},
		'&.ready': {
			'& #kaltura_player': {
				opacity: 1,
			},
		},
	},
}));

const getCurrentTimeSeconds = (player: any) => {
	if (!player) {
		return undefined;
	}

	if (typeof player.getCurrentTime === 'function') {
		return player.getCurrentTime();
	}

	if (typeof player.currentTime === 'number') {
		return player.currentTime;
	}

	if (typeof player.currentTime === 'function') {
		return player.currentTime();
	}

	return undefined;
};

const getDurationSeconds = (player: any) => {
	if (!player) {
		return undefined;
	}

	let mediaInfo: unknown;
	if (typeof player.getMediaInfo === 'function') {
		try {
			mediaInfo = player.getMediaInfo();
		} catch (error) {
			mediaInfo = undefined;
		}
	}

	if (mediaInfo && typeof mediaInfo === 'object') {
		const mediaInfoRecord = mediaInfo as Record<string, unknown>;
		if (typeof mediaInfoRecord.duration === 'number') {
			return mediaInfoRecord.duration;
		}

		if (typeof mediaInfoRecord.durationSeconds === 'number') {
			return mediaInfoRecord.durationSeconds;
		}

		if (typeof mediaInfoRecord.msDuration === 'number') {
			return mediaInfoRecord.msDuration / 1000;
		}

		if (typeof mediaInfoRecord.durationMs === 'number') {
			return mediaInfoRecord.durationMs / 1000;
		}
	}

	if (typeof player.getDuration === 'function') {
		const duration = player.getDuration();
		if (typeof duration === 'number') {
			return duration;
		}
	}

	if (typeof player.duration === 'number') {
		return player.duration;
	}

	return undefined;
};

interface CourseVideoProps {
	videoId: string;
	courseVideos: CourseVideoModel[];
	onVideoPlayerEvent(
		eventName: string,
		eventPayload: unknown,
		mediaProxy: unknown,
		eventPlaybackTime?: CourseVideoEventPlaybackTime
	): void;
	completionThresholdInSeconds: number;
	onCompletionThresholdPassed(): void;
}

export const CourseVideo = ({
	videoId,
	courseVideos,
	onVideoPlayerEvent,
	completionThresholdInSeconds,
	onCompletionThresholdPassed,
}: CourseVideoProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [videoPlayerReady, setVideoPlayerReady] = useState(false);
	const [videoPlayerTimedOut, setVideoPlayerTimedOut] = useState(false);
	const videoLoadingTimeoutRef = useRef<NodeJS.Timeout>();
	const completionIntervalRef = useRef<NodeJS.Timeout>();
	const completionThresholdPassedRef = useRef(false);

	const stopVideoLoadingTimer = useCallback(() => {
		if (!videoLoadingTimeoutRef.current) {
			return;
		}

		clearTimeout(videoLoadingTimeoutRef.current);
		videoLoadingTimeoutRef.current = undefined;
	}, []);

	const startVideoLoadingTimer = useCallback(() => {
		stopVideoLoadingTimer();
		videoLoadingTimeoutRef.current = setTimeout(() => {
			setVideoPlayerTimedOut(true);
			onVideoPlayerEvent('INITIALIZATION_ERROR', {}, {});
		}, 15000);
	}, [onVideoPlayerEvent, stopVideoLoadingTimer]);

	const stopCompletionInterval = useCallback(() => {
		if (!completionIntervalRef.current) {
			return;
		}

		clearInterval(completionIntervalRef.current);
		completionIntervalRef.current = undefined;
	}, []);

	const startCompletionInterval = useCallback(
		(player: any, videoIsPlaylist: boolean) => {
			stopCompletionInterval();

			completionIntervalRef.current = setInterval(() => {
				if (completionThresholdPassedRef.current) {
					return;
				}

				const currentTimeSeconds = getCurrentTimeSeconds(player);
				if (typeof currentTimeSeconds !== 'number' || Number.isNaN(currentTimeSeconds)) {
					return;
				}

				if (videoIsPlaylist) {
					const durationSeconds = getDurationSeconds(player);
					if (typeof durationSeconds !== 'number' || durationSeconds === 0 || Number.isNaN(durationSeconds)) {
						return;
					}

					if (currentTimeSeconds > durationSeconds * 0.9) {
						completionThresholdPassedRef.current = true;
						onCompletionThresholdPassed();
					}

					return;
				}

				if (currentTimeSeconds > completionThresholdInSeconds) {
					completionThresholdPassedRef.current = true;
					onCompletionThresholdPassed();
				}
			}, 1000);
		},
		[completionThresholdInSeconds, onCompletionThresholdPassed, stopCompletionInterval]
	);

	useEffect(() => {
		const video = courseVideos.find((courseVideo) => courseVideo.videoId === videoId);
		if (!video) {
			return;
		}

		let isActive = true;
		completionThresholdPassedRef.current = false;
		setVideoPlayerReady(false);
		setVideoPlayerTimedOut(false);
		startVideoLoadingTimer();

		const videoIsPlaylist = !!(video.kalturaPlaylistId && !video.kalturaEntryId);
		const { script, ready, destroy } = getKalturaScriptForVideo({
			videoPlayerId: 'kaltura_player',
			courseVideo: video,
			eventCallback: (eventName, eventPayload, mediaProxy, eventPlaybackTime) => {
				onVideoPlayerEvent(eventName, eventPayload, mediaProxy, eventPlaybackTime);
			},
			errorCallback: (error) => {
				if (!isActive) {
					return;
				}

				setVideoPlayerReady(false);
				setVideoPlayerTimedOut(false);
				stopVideoLoadingTimer();
				stopCompletionInterval();
				handleError(error);
			},
		});

		document.body.appendChild(script);
		ready()
			.then((playerInstance) => {
				if (!isActive) {
					return;
				}

				setVideoPlayerReady(true);
				setVideoPlayerTimedOut(false);
				stopVideoLoadingTimer();
				startCompletionInterval(playerInstance, videoIsPlaylist);
			})
			.catch(() => {});

		return () => {
			isActive = false;
			stopVideoLoadingTimer();
			stopCompletionInterval();
			destroy();
			if (script.isConnected) {
				document.body.removeChild(script);
			}
		};
	}, [
		completionThresholdInSeconds,
		courseVideos,
		handleError,
		onCompletionThresholdPassed,
		onVideoPlayerEvent,
		startVideoLoadingTimer,
		startCompletionInterval,
		stopCompletionInterval,
		stopVideoLoadingTimer,
		videoId,
	]);

	return (
		<>
			{videoPlayerTimedOut && (
				<InlineAlert
					className="mb-4"
					variant="warning"
					title="Video is taking longer than usual to load."
					description="If the issue persists, try reloading your browser window."
					action={{
						title: 'Reload',
						onClick: () => window.location.reload(),
					}}
				/>
			)}
			<div className={classes.videoPlayerSupplementsOuter}>
				{!videoPlayerReady && <Loader className={classes.videoPlayerLoader} />}
				<div className={classNames(classes.videoPlayerOuter, { ready: videoPlayerReady })}>
					<div id="kaltura_player" style={{ width: '100%', height: '100%' }} />
				</div>
			</div>
		</>
	);
};
