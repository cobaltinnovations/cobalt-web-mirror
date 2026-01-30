import React, { useCallback, useRef, useState } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import classNames from 'classnames';

import { getKalturaScriptForVideo } from '@/lib/utils';
import { institutionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import InlineAlert from '@/components/inline-alert';
import Loader from '@/components/loader';
import { createUseThemedStyles } from '@/jss/theme';
import useAccount from '@/hooks/use-account';

const useStyles = createUseThemedStyles((theme) => ({
	signInVideoModal: {
		maxWidth: 720,
	},
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

interface SignInVideoModalProps extends ModalProps {
	videoId: string;
}

const SignInVideoModal = ({ videoId, ...props }: SignInVideoModalProps) => {
	const classes = useStyles();
	const { institution } = useAccount();
	const handleError = useHandleError();
	const [videoPlayerReady, setVideoPlayerReady] = useState(false);
	const [videoPlayerTimedOut, setVideoPlayerTimedOut] = useState(false);
	const videoLoadingTimeoutRef = useRef<NodeJS.Timeout>();
	const scriptRef = useRef<HTMLScriptElement>();
	const playerCleanupRef = useRef<() => void>();
	const playerActiveRef = useRef(false);

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
		}, 15000);
	}, [stopVideoLoadingTimer]);

	const handleOnEnter = useCallback(async () => {
		playerActiveRef.current = true;
		setVideoPlayerReady(false);
		setVideoPlayerTimedOut(false);
		startVideoLoadingTimer();

		try {
			const response = await institutionService.getVideo(videoId).fetch();
			const { script, ready, destroy } = getKalturaScriptForVideo({
				videoPlayerId: 'kaltura_player',
				courseVideo: response.video,
				eventCallback: () => {},
				errorCallback: (error) => {
					if (!playerActiveRef.current) {
						return;
					}

					setVideoPlayerReady(false);
					setVideoPlayerTimedOut(false);
					stopVideoLoadingTimer();
					handleError(error);
				},
			});

			scriptRef.current = script;
			playerCleanupRef.current = destroy;
			document.body.appendChild(scriptRef.current);
			ready()
				.then(() => {
					if (!playerActiveRef.current) {
						return;
					}

					setVideoPlayerReady(true);
					setVideoPlayerTimedOut(false);
					stopVideoLoadingTimer();
				})
				.catch(() => {});
		} catch (error) {
			setVideoPlayerReady(false);
			setVideoPlayerTimedOut(false);
			stopVideoLoadingTimer();
			handleError(error);
		}
	}, [handleError, startVideoLoadingTimer, stopVideoLoadingTimer, videoId]);

	const handleOnExit = useCallback(() => {
		playerActiveRef.current = false;
		stopVideoLoadingTimer();
		playerCleanupRef.current?.();
		playerCleanupRef.current = undefined;
		if (!scriptRef.current) {
			return;
		}

		if (scriptRef.current.isConnected) {
			document.body.removeChild(scriptRef.current);
		}
		scriptRef.current = undefined;
	}, [stopVideoLoadingTimer]);

	return (
		<Modal
			centered
			{...props}
			onEntering={handleOnEnter}
			onExited={handleOnExit}
			dialogClassName={classes.signInVideoModal}
		>
			<Modal.Header closeButton>
				<Modal.Title>Welcome to {institution.platformName}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
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
			</Modal.Body>
		</Modal>
	);
};

export default SignInVideoModal;
