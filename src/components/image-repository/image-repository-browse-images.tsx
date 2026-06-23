import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

import ImageRepositoryImageTile from './image-repository-image-tile';
import ImageRepositoryUploadImageTile from './image-repository-upload-image-tile';
import { IMAGE_REPOSITORY_SCREEN_ID, ImageRepositoryScreenProps } from './image-repository.types';

const useStyles = createUseStyles({
	imageTileGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
		gap: 16,
	},
});

const imageTiles = Array.from({ length: 9 }, (_, index) => ({
	id: `image-tile-${index}`,
	name: 'image name',
}));

const ImageRepositoryBrowseImages: FC<ImageRepositoryScreenProps> = ({ onNavigate }) => {
	const classes = useStyles();

	return (
		<div className={classes.imageTileGrid}>
			<ImageRepositoryUploadImageTile
				onClick={() => {
					onNavigate(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
				}}
			/>
			{imageTiles.map((imageTile) => (
				<ImageRepositoryImageTile key={imageTile.id} imageName={imageTile.name} />
			))}
		</div>
	);
};

export default ImageRepositoryBrowseImages;
