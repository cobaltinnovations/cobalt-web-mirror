import { v4 as uuidv4 } from 'uuid';
import React, { FC, useRef, useState, useCallback } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import ReactCrop, { Crop } from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';
import useFlags from '@/hooks/use-flags';
import SvgIcon from './svg-icon';

function getCroppedImageAsBlob(
	image: HTMLImageElement,
	crop: Crop
): Promise<{ blob: Blob; extension: string }> | undefined {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const cropX = crop.unit === '%' ? (image.naturalWidth * (crop.x ?? 0)) / 100 : (crop.x ?? 0);
	const cropY = crop.unit === '%' ? (image.naturalHeight * (crop.y ?? 0)) / 100 : (crop.y ?? 0);
	const cropWidth = crop.unit === '%' ? (image.naturalWidth * (crop.width ?? 0)) / 100 : (crop.width ?? 0);
	const cropHeight = crop.unit === '%' ? (image.naturalHeight * (crop.height ?? 0)) / 100 : (crop.height ?? 0);
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

const getInitialCrop = (useAspect: boolean): Crop => {
	const width = 90;
	const height = useAspect ? (width * 9) / 16 : 90;

	return {
		unit: '%',
		width,
		height,
		x: (100 - width) / 2,
		y: (100 - height) / 2,
		...(useAspect && { aspect: 16 / 9 }),
	};
};

interface SessionCropModalProps extends ModalProps {
	imageSource: string;
	imageName?: string;
	onSave(blob: Blob, fileName: string): void;
	cropImage?: boolean;
}

const SessionCropModal: FC<SessionCropModalProps> = ({
	cropImage = true,
	imageSource,
	imageName,
	onSave,
	onHide,
	...props
}) => {
	useTrackModalView('SessionCropModal', props.show);
	const { addFlag } = useFlags();
	const imageRef = useRef<HTMLImageElement | null>(null);
	const classes = useSessionCropModalStyles();
	const [crop, setCrop] = useState<Crop>(() => getInitialCrop(cropImage));
	const [isDragging, setIsDragging] = useState(false);

	const onLoad = useCallback((htmlImageElement: HTMLImageElement) => {
		imageRef.current = htmlImageElement;
	}, []);

	async function handleOnSaveButtonClick() {
		if (!imageRef.current) {
			return;
		}

		try {
			const cropResult = await getCroppedImageAsBlob(imageRef.current, crop);

			if (!cropResult) {
				return;
			}

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
		setCrop(getInitialCrop(cropImage));
	}, [cropImage]);

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
					crop={crop}
					onChange={(_, percentCrop) => {
						setCrop(percentCrop);
					}}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<img src={imageSource} onLoad={(event) => onLoad(event.currentTarget)} />
				</ReactCrop>
				<div className="d-flex mt-5 align-items-center">
					<SvgIcon kit="fas" icon="triangle-exclamation" size={16} className={classes.infoIcon} />
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
