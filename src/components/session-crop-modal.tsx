import React, { FC, useRef, useState, useCallback } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import 'react-image-crop/dist/ReactCrop.css';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';

function getCroppedImageAsBlob(image: HTMLImageElement, crop: any): Promise<Blob> | undefined {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	canvas.width = crop.width * scaleX;
	canvas.height = crop.height * scaleY;

	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		crop.width * scaleX,
		crop.height * scaleY
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					return reject({ code: 400, message: 'Error converting crop to blob.' });
				}

				resolve(blob);
			},
			'image/jpeg',
			0.9
		);
	});
}

const useSessionCropModalStyles = createUseThemedStyles((theme) => ({
	sessionCropModal: {
		maxWidth: 600,
	},
	infoIcon: {
		width: 20,
		height: 20,
		marginRight: 10,
		fill: theme.colors.w500,
	},
}));

interface SessionCropModalProps extends ModalProps {
	imageSource: string;
	onSave(blob: Blob): void;
}

const SessionCropModal: FC<SessionCropModalProps> = ({ imageSource, onSave, onHide, ...props }) => {
	useTrackModalView('SessionCropModal', props.show);
	const handleError = useHandleError();
	const imageRef = useRef<HTMLImageElement>();
	const classes = useSessionCropModalStyles();
	const [crop, setCrop] = useState({
		width: 90,
		aspect: 16 / 9,
		unit: '%' as '%',
	});
	const [isDragging, setIsDragging] = useState(false);

	const onLoad = useCallback((htmlImageElement: HTMLImageElement) => {
		imageRef.current = htmlImageElement;
	}, []);

	function handleCropChange(newCrop: any) {
		setCrop(newCrop);
	}

	async function handleOnSaveButtonClick() {
		if (!imageRef.current) {
			return;
		}

		try {
			const blob = await getCroppedImageAsBlob(imageRef.current, crop);

			if (!blob) {
				return;
			}

			onSave(blob);
		} catch (error) {
			handleError(error);
		}
	}

	const handleDragStart = useCallback(() => {
		setIsDragging(true);
	}, []);

	const handleDragEnd = useCallback(() => {
		setTimeout(() => {
			setIsDragging(false);
		}, 0);
	}, []);

	const handleEntered = useCallback(() => {
		setCrop({
			width: 90,
			aspect: 16 / 9,
			unit: '%' as '%',
		});
	}, []);

	const handleHide = useCallback(() => {
		if (isDragging) {
			return;
		}

		if (onHide) {
			onHide();
		}
	}, [isDragging, onHide]);

	return (
		<Modal
			{...props}
			onEntered={handleEntered}
			onHide={handleHide}
			dialogClassName={classes.sessionCropModal}
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>crop image</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ReactCrop
					src={imageSource}
					onImageLoaded={onLoad}
					crop={crop}
					onChange={handleCropChange}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				/>
				<div className="d-flex mt-5 align-items-center">
					<InfoIcon className={classes.infoIcon} />
					<p className="mb-0 fs-small">Blurry images can occur if the image uploaded is too small.</p>
				</div>
			</Modal.Body>
			<Modal.Footer className="d-flex justify-content-end">
				<Button variant="outline-primary" size="sm" onClick={handleHide}>
					Cancel
				</Button>
				<Button variant="primary" size="sm" className="ms-2" onClick={handleOnSaveButtonClick}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SessionCropModal;
