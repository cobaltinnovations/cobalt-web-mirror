import React, { FC, useEffect, useState } from 'react';

import Loader from '@/components/loader';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { mediaService, type ImageListModel } from '@/lib/services/media-service';

import ImageRepositoryImageTile from './image-repository-image-tile';
import ImageRepositoryUploadImageTile from './image-repository-upload-image-tile';
import { IMAGE_REPOSITORY_SCREEN_ID, ImageRepositoryScreenProps } from './image-repository.types';

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
	const handleError = useHandleError();
	const [images, setImages] = useState<ImageListModel[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const request = mediaService.getImages();

		setIsLoading(true);

		request
			.fetch()
			.then((response) => {
				if (!isMounted) {
					return;
				}

				setImages(response.images);
			})
			.catch((error) => {
				if (!isMounted) {
					return;
				}

				handleError(error);
			})
			.finally(() => {
				if (!isMounted) {
					return;
				}

				setIsLoading(false);
			});

		return () => {
			isMounted = false;
			request.abort();
		};
	}, [handleError]);

	return (
		<div className={classes.imageTileGrid}>
			<ImageRepositoryUploadImageTile
				onClick={() => {
					onNavigate(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
				}}
			/>
			{isLoading && (
				<div className={classes.loadingState}>
					<Loader className="position-static d-inline-flex" />
				</div>
			)}
			{!isLoading && images.length === 0 && (
				<div className={classes.emptyState}>
					<p className="m-0">No images have been added yet.</p>
				</div>
			)}
			{!isLoading &&
				images.map((image) => (
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
	);
};

export default ImageRepositoryBrowseImages;
