import { v4 as uuidv4 } from 'uuid';
import React, { FC, useRef, useState, useCallback } from 'react';
import { ModalProps, Modal, Button, Form } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';
import useFlags from '@/hooks/use-flags';
import SvgIcon from './svg-icon';

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
	sizeSelectionList: {
		gap: 24,
		display: 'flex',
		marginTop: 24,
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	sizeSelectionOption: {
		marginBottom: 0,
	},
}));

export enum SIZE_SELECTIONS {
	SQUARE = 'SQUARE',
	RECTANGLE = 'RECTANGLE',
	FREEFORM = 'FREEFORM',
}

const SIZE_SELECTION_OPTIONS: Array<{
	label: string;
	value: SIZE_SELECTIONS;
	aspect?: number;
}> = [
	{
		label: 'Square',
		value: SIZE_SELECTIONS.SQUARE,
		aspect: 1,
	},
	{
		label: 'Rectangle',
		value: SIZE_SELECTIONS.RECTANGLE,
		aspect: 16 / 9,
	},
	{
		label: 'Freeform',
		value: SIZE_SELECTIONS.FREEFORM,
	},
];

const getDefaultSizeSelection = (cropImage: boolean) =>
	cropImage ? SIZE_SELECTIONS.RECTANGLE : SIZE_SELECTIONS.FREEFORM;

const getInitialCrop = (sizeSelection: SIZE_SELECTIONS, imageWidth?: number, imageHeight?: number): ReactCrop.Crop => {
	const sizeSelectionOption = SIZE_SELECTION_OPTIONS.find((option) => option.value === sizeSelection);

	if (!sizeSelectionOption?.aspect) {
		const width = 80;
		const height = 80;

		return {
			x: (100 - width) / 2,
			y: (100 - height) / 2,
			width,
			height,
			unit: '%' as '%',
		};
	}

	if (!imageWidth || !imageHeight) {
		return {
			x: sizeSelection === SIZE_SELECTIONS.SQUARE ? 25 : 10,
			y: 10,
			width: sizeSelection === SIZE_SELECTIONS.SQUARE ? 50 : 80,
			aspect: sizeSelectionOption.aspect,
			unit: '%' as '%',
		};
	}

	const targetWidthPercent = sizeSelection === SIZE_SELECTIONS.SQUARE ? 50 : 80;
	const maxHeightPercent = 80;
	let widthPercent = targetWidthPercent;
	let heightPercent = (widthPercent * imageWidth) / (sizeSelectionOption.aspect * imageHeight);

	if (heightPercent > maxHeightPercent) {
		heightPercent = maxHeightPercent;
		widthPercent = (heightPercent * sizeSelectionOption.aspect * imageHeight) / imageWidth;
	}

	return {
		unit: '%' as '%',
		aspect: sizeSelectionOption.aspect,
		width: widthPercent,
		height: heightPercent,
		x: (100 - widthPercent) / 2,
		y: (100 - heightPercent) / 2,
	};
};

interface SessionCropModalProps extends ModalProps {
	imageSource: string;
	imageName?: string;
	onSave(blob: Blob, fileName: string): void;
	cropImage?: boolean;
	showSizeSelection?: boolean;
	lockSizeSelection?: SIZE_SELECTIONS;
}

const SessionCropModal: FC<SessionCropModalProps> = ({
	cropImage = true,
	showSizeSelection = true,
	lockSizeSelection,
	imageSource,
	imageName,
	onSave,
	onHide,
	...props
}) => {
	useTrackModalView('SessionCropModal', props.show);
	const { addFlag } = useFlags();
	const imageRef = useRef<HTMLImageElement>();
	const classes = useSessionCropModalStyles();
	const defaultSizeSelection = getDefaultSizeSelection(cropImage);
	const [sizeSelection, setSizeSelection] = useState<SIZE_SELECTIONS>(lockSizeSelection ?? defaultSizeSelection);
	const effectiveSizeSelection = lockSizeSelection ?? sizeSelection;
	const [crop, setCrop] = useState<ReactCrop.Crop>(() => getInitialCrop(lockSizeSelection ?? defaultSizeSelection));
	const [isDragging, setIsDragging] = useState(false);

	const onLoad = useCallback(
		(htmlImageElement: HTMLImageElement) => {
			imageRef.current = htmlImageElement;
			setCrop(
				getInitialCrop(
					lockSizeSelection ?? defaultSizeSelection,
					htmlImageElement.width,
					htmlImageElement.height
				)
			);
		},
		[defaultSizeSelection, lockSizeSelection]
	);

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

	const handleSizeSelectionChange = useCallback(
		(nextSizeSelection: SIZE_SELECTIONS) => {
			if (lockSizeSelection) {
				return;
			}

			setSizeSelection(nextSizeSelection);
			setCrop(getInitialCrop(nextSizeSelection, imageRef.current?.width, imageRef.current?.height));
		},
		[lockSizeSelection]
	);

	const handleEntered = useCallback(() => {
		const nextSizeSelection = lockSizeSelection ?? defaultSizeSelection;

		setSizeSelection(nextSizeSelection);
		setCrop(getInitialCrop(nextSizeSelection, imageRef.current?.width, imageRef.current?.height));
	}, [defaultSizeSelection, lockSizeSelection]);

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
				{showSizeSelection && (
					<div className={classes.sizeSelectionList}>
						{SIZE_SELECTION_OPTIONS.map((sizeSelectionOption) => (
							<Form.Check
								key={sizeSelectionOption.value}
								id={`crop-size-selection-${sizeSelectionOption.value.toLowerCase()}`}
								inline
								type="radio"
								label={sizeSelectionOption.label}
								name="crop-size-selection"
								className={classes.sizeSelectionOption}
								checked={effectiveSizeSelection === sizeSelectionOption.value}
								disabled={!!lockSizeSelection}
								onChange={() => {
									handleSizeSelectionChange(sizeSelectionOption.value);
								}}
							/>
						))}
					</div>
				)}
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
