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
		color: theme.colors.n0,
		backgroundColor: theme.colors.n500,
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
}

const ImageRepositoryImageTile: FC<ImageRepositoryImageTileProps> = ({ imageName }) => {
	const classes = useStyles();

	return (
		<div className={classes.imageTile}>
			<div className={classes.imageTilePreview} />
			<div className={classes.imageTileNameOuter}>
				<p className={`${classes.imageTileName} m-0`}>{imageName}</p>
			</div>
		</div>
	);
};

export default ImageRepositoryImageTile;
