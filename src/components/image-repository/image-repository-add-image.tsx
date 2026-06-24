import React, { FC } from 'react';

import { adminService } from '@/lib/services';

import ImageRepositoryUploader from './image-repository-uploader';
import { ImageRepositoryScreenProps } from './image-repository.types';

const ImageRepositoryAddImage: FC<ImageRepositoryScreenProps> = () => {
	return (
		<ImageRepositoryUploader
			presignedUploadGetter={(blob, name) => {
				return adminService.getPresignedUploadUrl({
					contentType: blob.type,
					filename: name,
					filesize: blob.size,
				}).fetch;
			}}
		/>
	);
};

export default ImageRepositoryAddImage;
