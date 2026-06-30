import React, { FC } from 'react';

import ImageRepositoryFileInput from './image-repository-file-input';

interface ImageRepositoryAddImageProps {
	onFileSelected(file: File): void;
	disabled?: boolean;
}

const ImageRepositoryAddImage: FC<ImageRepositoryAddImageProps> = ({ disabled, onFileSelected }) => {
	return <ImageRepositoryFileInput disabled={disabled} onFileSelected={onFileSelected} />;
};

export default ImageRepositoryAddImage;
