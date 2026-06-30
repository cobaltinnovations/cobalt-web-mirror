import React, { FC } from 'react';
import { Button } from 'react-bootstrap';

import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	duplicateImageScreen: {
		minHeight: 520,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		border: `1px dashed ${theme.colors.d500}`,
		backgroundColor: theme.colors.d50,
		textAlign: 'center',
	},
	duplicateIcon: {
		marginBottom: 28,
		color: theme.colors.d500,
	},
	duplicateActions: {
		display: 'flex',
		justifyContent: 'center',
		gap: 8,
		marginTop: 28,
	},
}));

interface ImageRepositoryDuplicateImageProps {
	onContinueWithUpload(): void;
	onUseExistingImage(): void;
}

const ImageRepositoryDuplicateImage: FC<ImageRepositoryDuplicateImageProps> = ({
	onContinueWithUpload,
	onUseExistingImage,
}) => {
	const classes = useStyles();

	return (
		<div className={classes.duplicateImageScreen}>
			<div>
				<SvgIcon className={classes.duplicateIcon} kit="fas" icon="diamond-exclamation" size={42} />
				<h3 className="mb-0 fs-large fw-semibold">This image already exists</h3>
				<div className={classes.duplicateActions}>
					<Button variant="primary" onClick={onUseExistingImage}>
						Use existing image
					</Button>
					<Button variant="outline-primary" onClick={onContinueWithUpload}>
						Continue with new upload
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ImageRepositoryDuplicateImage;
