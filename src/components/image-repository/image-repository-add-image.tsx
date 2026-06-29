import React, { FC } from 'react';

import ImageRepositoryFileInput from './image-repository-file-input';

interface ImageRepositoryAddImageProps {
	onFileSelected(file: File): void;
}

const ImageRepositoryAddImage: FC<ImageRepositoryAddImageProps> = ({ onFileSelected }) => {
	return <ImageRepositoryFileInput onFileSelected={onFileSelected} />;
};

export default ImageRepositoryAddImage;
