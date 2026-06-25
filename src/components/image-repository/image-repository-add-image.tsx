import React, { FC } from 'react';

import ImageRepositoryFileInput from './image-repository-file-input';
import { ImageRepositoryScreenProps } from './image-repository.types';

const ImageRepositoryAddImage: FC<ImageRepositoryScreenProps> = ({ onFileSelected }) => {
	return <ImageRepositoryFileInput onFileSelected={(file) => onFileSelected?.(file)} />;
};

export default ImageRepositoryAddImage;
