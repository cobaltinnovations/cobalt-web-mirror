import React, { FC, useEffect, useState } from 'react';

import useHandleError from '@/hooks/use-handle-error';
import { PresignedUploadModel } from '@/lib/models';
import { FILE_UPLOAD_TYPE_ID, ImageModel, mediaService, MediaImageUploadResult } from '@/lib/services/media-service';

import { ImageRepositoryScreenProps, ImageRepositoryUploadAsset } from './image-repository.types';
import ImageRepositoryUploader, { IMAGE_REPOSITORY_UPLOAD_STATUS } from './image-repository-uploader';

const uploadStepsCount = 3;

function uploadBlobToPresignedUrl(
	blob: Blob,
	presignedUpload: PresignedUploadModel,
	onProgress: (percentage: number) => void
): Promise<string> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) {
				onProgress(Math.round((event.loaded * 100) / event.total));
			}
		});

		xhr.addEventListener('load', () => {
			resolve(presignedUpload.accessUrl);
		});

		xhr.addEventListener('error', () => {
			reject({
				code: 'UPLOAD_ERROR',
				message: 'There was an error uploading your image.',
			});
		});

		xhr.addEventListener('abort', () => {
			reject({
				code: 'UPLOAD_ABORTED',
				message: 'The image upload was aborted.',
			});
		});

		xhr.open(presignedUpload.httpMethod, presignedUpload.url, true);

		for (let httpHeaderName in presignedUpload.httpHeaders) {
			xhr.setRequestHeader(httpHeaderName, presignedUpload.httpHeaders[httpHeaderName]);
		}

		xhr.send(blob);
	});
}

interface UploadMediaImageAssetOptions {
	asset: ImageRepositoryUploadAsset;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	sourceImageId?: string;
	onProgress(percentage: number): void;
}

async function uploadMediaImageAsset({
	asset,
	fileUploadTypeId,
	sourceImageId,
	onProgress,
}: UploadMediaImageAssetOptions): Promise<ImageModel> {
	const {
		mediaImageUploadResult,
	}: {
		mediaImageUploadResult: MediaImageUploadResult;
	} = await mediaService
		.getPresignedUpload({
			fileUploadTypeId,
			filename: asset.imageName,
			contentType: asset.blob.type,
			filesize: asset.blob.size,
			width: asset.width,
			height: asset.height,
			sourceImageId,
		})
		.fetch();

	await uploadBlobToPresignedUrl(asset.blob, mediaImageUploadResult.fileUploadResult.presignedUpload, onProgress);

	const { image } = await mediaService.setImageAsUploaded(mediaImageUploadResult.imageId).fetch();

	return image;
}

const ImageRepositoryUploadImage: FC<ImageRepositoryScreenProps> = ({
	imageUploadPayload,
	onImageUploaded,
	onUploadStatusChange,
}) => {
	const handleError = useHandleError();
	const [progress, setProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
		IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING
	);

	useEffect(() => {
		let isMounted = true;

		async function uploadImage() {
			if (!imageUploadPayload) {
				return;
			}

			try {
				setProgress(0);
				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING);
				onUploadStatusChange?.(true);

				const setStepProgress = (stepIndex: number, stepProgress: number) => {
					if (!isMounted) {
						return;
					}

					setProgress(Math.round(((stepIndex + stepProgress / 100) / uploadStepsCount) * 100));
				};

				const rawImage = await uploadMediaImageAsset({
					asset: imageUploadPayload.rawImage,
					fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_RAW,
					onProgress: (percentage) => {
						setStepProgress(0, percentage);
					},
				});

				const croppedImage = await uploadMediaImageAsset({
					asset: imageUploadPayload.croppedImage,
					fileUploadTypeId: imageUploadPayload.croppedImage.fileUploadTypeId,
					sourceImageId: rawImage.imageId,
					onProgress: (percentage) => {
						setStepProgress(1, percentage);
					},
				});

				await uploadMediaImageAsset({
					asset: imageUploadPayload.croppedImage.thumbnail,
					fileUploadTypeId: imageUploadPayload.croppedImage.thumbnail.fileUploadTypeId,
					sourceImageId: croppedImage.imageId,
					onProgress: (percentage) => {
						setStepProgress(2, percentage);
					},
				});

				if (isMounted) {
					setProgress(100);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE);
					onUploadStatusChange?.(false);
					onImageUploaded?.();
				}
			} catch (error) {
				if (isMounted) {
					setProgress(0);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.ERROR);
					onUploadStatusChange?.(false);
					handleError(error);
				}
			}
		}

		uploadImage();

		return () => {
			isMounted = false;
			onUploadStatusChange?.(false);
		};
	}, [handleError, imageUploadPayload, onImageUploaded, onUploadStatusChange]);

	if (!imageUploadPayload) {
		return null;
	}

	return <ImageRepositoryUploader progress={progress} uploadStatus={uploadStatus} />;
};

export default ImageRepositoryUploadImage;
