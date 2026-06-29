import React, { FC, useCallback, useMemo, useState } from 'react';

import { createUseThemedStyles } from '@/jss/theme';
import { mediaService, type ImageListModel } from '@/lib/services/media-service';

import AsyncWrapper from '@/components/async-page';
import {
	IMAGE_REPOSITORY_SCREEN_ID,
	ImageRepositoryScreenProps,
} from '@/components/image-repository/image-repository.types';
import ImageRepositoryImageTile from '@/components/image-repository/image-repository-image-tile';
import ImageRepositoryUploadImageTile from '@/components/image-repository/image-repository-upload-image-tile';

const useStyles = createUseThemedStyles((theme) => ({
	imageTileGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
		gap: 16,
	},
	loadingState: {
		gridColumn: '1 / -1',
		minHeight: 220,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyState: {
		gridColumn: '1 / -1',
		minHeight: 220,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n500,
		textAlign: 'center',
	},
}));

const ImageRepositoryBrowseImages: FC<ImageRepositoryScreenProps> = ({ onNavigate, onRepositoryImageSelected }) => {
	const classes = useStyles();
	const [images, setImages] = useState<ImageListModel[]>([]);

	const request = useMemo(() => {
		return mediaService.getImages();
	}, []);

	const fetchData = useCallback(async () => {
		const response = await request.fetch();
		setImages(response.images);
	}, [request]);

	return (
		<AsyncWrapper fetchData={fetchData} abortFetch={request.abort}>
			<div className={classes.imageTileGrid}>
				<ImageRepositoryUploadImageTile
					onClick={() => {
						onNavigate(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
					}}
				/>
				{images.map((image) => (
					<ImageRepositoryImageTile
						key={image.sourceImageId}
						imageName={image.thumbnail.filename}
						imageUrl={image.thumbnail.url}
						onClick={() => {
							onRepositoryImageSelected?.(image.sourceImageId);
						}}
					/>
				))}
			</div>
		</AsyncWrapper>
	);
};

export default ImageRepositoryBrowseImages;
