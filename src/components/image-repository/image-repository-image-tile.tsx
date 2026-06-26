import React, { FC } from 'react';

import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	imageTile: {
		display: 'block',
		width: '100%',
		padding: 0,
		overflow: 'hidden',
		textAlign: 'left',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		borderRadius: 8,
	},
	imageTilePreview: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		aspectRatio: '16 / 9',
		backgroundColor: theme.colors.n500,
	},
	imageTilePreviewImage: {
		width: '100%',
		height: '100%',
		display: 'block',
		objectFit: 'cover',
	},
	imageTileNameOuter: {
		padding: '14px 14px 16px',
	},
	imageTileName: {
		color: theme.colors.n700,
	},
}));

interface ImageRepositoryImageTileProps {
	imageName: string;
	imageUrl?: string;
}

const ImageRepositoryImageTile: FC<ImageRepositoryImageTileProps> = ({ imageName, imageUrl }) => {
	const classes = useStyles();

	return (
		<div className={classes.imageTile}>
			<div className={classes.imageTilePreview}>
				{imageUrl && <img className={classes.imageTilePreviewImage} src={imageUrl} alt={imageName} />}
			</div>
			<div className={classes.imageTileNameOuter}>
				<p className={`${classes.imageTileName} m-0`}>{imageName}</p>
			</div>
		</div>
	);
};

export default ImageRepositoryImageTile;
