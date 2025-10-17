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
		setVideoPlayerReady(false);
		setVideoPlayerTimedOut(false);
		startVideoLoadingTimer();

		try {
			const response = await institutionService.getVideo(videoId).fetch();
			const { script } = getKalturaScriptForVideo({
				videoPlayerId: 'kaltura_player',
				courseVideo: response.video,
				eventCallback: (eventName) => {
					if (eventName === 'playerReady') {
						setVideoPlayerReady(true);
						setVideoPlayerTimedOut(false);
						stopVideoLoadingTimer();
					}
				},
				errorCallback: (error) => {
					setVideoPlayerReady(false);
					setVideoPlayerTimedOut(false);
					stopVideoLoadingTimer();
					handleError(error);
				},
			});

			scriptRef.current = script;
			document.body.appendChild(scriptRef.current);
		} catch (error) {
			setVideoPlayerReady(false);
			setVideoPlayerTimedOut(false);
			stopVideoLoadingTimer();
			handleError(error);
		}
	}, [handleError, startVideoLoadingTimer, stopVideoLoadingTimer, videoId]);

	const handleOnExit = useCallback(() => {
		if (!scriptRef.current) {
			return;
		}

		document.body.removeChild(scriptRef.current);
	}, []);

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
