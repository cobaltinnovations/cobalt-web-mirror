import { v4 as uuidv4 } from 'uuid';
import React, { FC, useRef, useState, useCallback } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import 'react-image-crop/dist/ReactCrop.css';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';
import useFlags from '@/hooks/use-flags';

function getCroppedImageAsBlob(
	image: HTMLImageElement,
	crop: ReactCrop.Crop
): Promise<{ blob: Blob; extension: string }> | undefined {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const cropX = crop.x ?? 0;
	const cropY = crop.y ?? 0;
	const cropWidth = crop.width ?? 0;
	const cropHeight = crop.height ?? 0;
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	canvas.width = cropWidth * scaleX;
	canvas.height = cropHeight * scaleY;

	ctx.drawImage(
		image,
		cropX * scaleX,
		cropY * scaleY,
		cropWidth * scaleX,
		cropHeight * scaleY,
		0,
		0,
		cropWidth * scaleX,
		cropHeight * scaleY
	);

	return new Promise((resolve, reject) => {
		let hasTransparency = false;

		try {
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imageData.data;

			for (let i = 3; i < data.length; i += 4) {
				if (data[i] < 255) {
					hasTransparency = true;
					break;
				}
			}
		} catch (err) {
			hasTransparency = false;
		}

		const mimeType = hasTransparency ? 'image/png' : 'image/jpeg';
		const extension = hasTransparency ? 'png' : 'jpg';
		const quality = hasTransparency ? 1.0 : 0.9;

		canvas.toBlob(
			(blob) => {
				if (!blob) {
					return reject({
						code: 400,
						message: 'Error cropping image, please recrop your image and try again.',
					});
				}

				resolve({ blob, extension });
			},
			mimeType,
			quality
		);
	});
}

function stripExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf('.');

	if (lastDotIndex <= 0) {
		return filename;
	}

	return filename.slice(0, lastDotIndex);
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
	imageName?: string;
	onSave(blob: Blob, fileName: string): void;
}

const SessionCropModal: FC<SessionCropModalProps> = ({ imageSource, imageName, onSave, onHide, ...props }) => {
	useTrackModalView('SessionCropModal', props.show);
	const { addFlag } = useFlags();
	const imageRef = useRef<HTMLImageElement>();
	const classes = useSessionCropModalStyles();
	const [crop, setCrop] = useState<ReactCrop.Crop>({
		width: 90,
		aspect: 16 / 9,
		unit: '%' as '%',
	});
	const [isDragging, setIsDragging] = useState(false);

	const onLoad = useCallback((htmlImageElement: HTMLImageElement) => {
		imageRef.current = htmlImageElement;
	}, []);

	function handleCropChange(newCrop: ReactCrop.Crop) {
		setCrop(newCrop);
	}

	async function handleOnSaveButtonClick() {
		if (!imageRef.current) {
			return;
		}

		try {
			const cropResult = await getCroppedImageAsBlob(imageRef.current, crop);

			if (!cropResult) {
				return;
			}

			console.log('imageName', imageName);

			onSave(cropResult.blob, `${stripExtension(imageName ?? uuidv4())}.${cropResult.extension}`);
		} catch (error) {
			addFlag({
				variant: 'danger',
				title: 'Error',
				description: (error as any).message,
				actions: [],
			});
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
