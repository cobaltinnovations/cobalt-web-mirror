import React, { FC } from 'react';

import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	uploadImageTile: {
		width: '100%',
		height: '100%',
		minHeight: 160,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 22,
		padding: 24,
		borderRadius: 8,
		color: theme.colors.n500,
		backgroundColor: theme.colors.n50,
		border: `1px dashed ${theme.colors.n300}`,
	},
}));

interface ImageRepositoryUploadImageTileProps {
	onClick(): void;
}

const ImageRepositoryUploadImageTile: FC<ImageRepositoryUploadImageTileProps> = ({ onClick }) => {
	const classes = useStyles();

	return (
		<button className={classes.uploadImageTile} type="button" onClick={onClick}>
			<SvgIcon kit="far" icon="cloud-arrow-up" size={36} />
			<p className="m-0">Upload new image</p>
		</button>
	);
};

export default ImageRepositoryUploadImageTile;
