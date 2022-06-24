import React, { FC, useRef, useState, useCallback } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import 'react-image-crop/dist/ReactCrop.css';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';

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
			1
		);
	});
}

const useSessionCropModalStyles = createUseThemedStyles((theme) => ({
	sessionCropModal: {
		width: '90%',
		maxWidth: 600,
		margin: '0 auto',
	},
	infoIcon: {
		width: 20,
		height: 20,
		marginRight: 10,
		fill: theme.colors.warning,
	},
}));

interface SessionCropModalProps extends ModalProps {
	imageSource: string;
	onSave(blob: Blob): void;
}

const SessionCropModal: FC<SessionCropModalProps> = ({ imageSource, onSave, ...props }) => {
	const handleError = useHandleError();
	const imageRef = useRef<HTMLImageElement>();
	const classes = useSessionCropModalStyles();
	const [crop, setCrop] = useState({
		width: 90,
		aspect: 16 / 9,
		unit: '%' as '%',
	});

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

	return (
		<Modal {...props} dialogClassName={classes.sessionCropModal} centered>
			<Modal.Header closeButton bsPrefix="cobalt-modal__header--admin">
				<Modal.Title bsPrefix="cobalt-modal__title--admin">crop image</Modal.Title>
			</Modal.Header>
			<Modal.Body bsPrefix="cobalt-modal__body--admin--small">
				<ReactCrop src={imageSource} onImageLoaded={onLoad} crop={crop} onChange={handleCropChange} />
				<div className="d-flex mt-5 align-items-center">
					<InfoIcon className={classes.infoIcon} />
					<p className="mb-0 font-size-xxs">Blurry images can occur if the image uploaded is too small.</p>
				</div>
			</Modal.Body>

			<Modal.Footer bsPrefix="cobalt-modal__footer--admin">
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" className="ml-3" onClick={handleOnSaveButtonClick}>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SessionCropModal;
