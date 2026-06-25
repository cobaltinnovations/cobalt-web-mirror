import React, { FC, useCallback } from 'react';

import { adminService } from '@/lib/services';

import { ImageRepositoryScreenProps } from './image-repository.types';
import ImageRepositoryUploader from './image-repository-uploader';

const ImageRepositoryUploadImage: FC<ImageRepositoryScreenProps> = ({
	croppedImage,
	onImageUploaded,
	onUploadStatusChange,
}) => {
	const presignedUploadGetter = useCallback((blob: Blob, name: string) => {
		return adminService.getPresignedUploadUrl({
			contentType: blob.type,
			filename: name,
			filesize: blob.size,
		}).fetch;
	}, []);

	if (!croppedImage) {
		return null;
	}

	return (
		<ImageRepositoryUploader
			blob={croppedImage.blob}
			fileName={croppedImage.imageName}
			presignedUploadGetter={presignedUploadGetter}
			onUploadStatusChange={onUploadStatusChange}
			onUploadComplete={(fileUploadId, imageUrl, imageName) => {
				onImageUploaded?.({
					fileUploadId,
					imageName,
					imageUrl,
					imageAltText: croppedImage.imageAltText,
				});
			}}
		/>
	);
};

export default ImageRepositoryUploadImage;
