import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import InlineAlert from '@/components/inline-alert';
import Loader from '@/components/loader';
import NoData from '@/components/no-data';
import { createUseThemedStyles } from '@/jss/theme';
import {
	FILE_UPLOAD_TYPE_ID,
	mediaService,
	type ImageDetailModel,
	type ImageModel,
} from '@/lib/services/media-service';

import { IMAGE_REPOSITORY_CROP_RATIO, ImageRepositoryScreenProps } from './image-repository.types';

const fileUploadTypeIdByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, FILE_UPLOAD_TYPE_ID> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
};

const aspectRatioByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, string> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: '16 / 9',
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: '4 / 3',
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: '1 / 1',
};

const useStyles = createUseThemedStyles((theme) => ({
	selectedImageScreen: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) 296px',
		minHeight: 575,
	},
	imagePanel: {
		minWidth: 0,
		display: 'flex',
		flexDirection: 'column',
		padding: '32px',
		borderRight: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n0,
	},
	imagePanelHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 24,
		marginBottom: 24,
	},
	ratioControls: {
		display: 'flex',
		alignItems: 'center',
		gap: 18,
	},
	ratioOption: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		margin: 0,
		'& .form-check-input': {
			marginRight: 0,
		},
	},
	imagePreviewOuter: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 0,
	},
	imagePreview: {
		width: '100%',
		maxHeight: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		aspectRatio: ({ cropRatio }: { cropRatio: IMAGE_REPOSITORY_CROP_RATIO }) => aspectRatioByCropRatio[cropRatio],
		backgroundColor: theme.colors.n500,
	},
	imagePreviewImage: {
		width: '100%',
		height: '100%',
		display: 'block',
		objectFit: 'contain',
	},
	metadataPanel: {
		padding: 24,
		backgroundColor: theme.colors.n0,
	},
	loadingState: {
		gridColumn: '1 / -1',
		minHeight: 575,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

function getImageVariantForRatio(
	variants: ImageModel[],
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO
): ImageModel | undefined {
	return variants.find((variant) => variant.fileUploadTypeId === fileUploadTypeIdByCropRatio[cropRatio]);
}

type ImageRepositorySelectedImageProps = Pick<
	ImageRepositoryScreenProps,
	'onRepositoryImageRecrop' | 'onRepositoryImageVariantAvailabilityChange' | 'repositoryImageId'
>;

const ImageRepositorySelectedImage: FC<ImageRepositorySelectedImageProps> = ({
	onRepositoryImageRecrop,
	onRepositoryImageVariantAvailabilityChange,
	repositoryImageId,
}) => {
	const [cropRatio, setCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
	const [imageDetails, setImageDetails] = useState<ImageDetailModel>();
	const classes = useStyles({ cropRatio });

	const request = useMemo(() => {
		if (!repositoryImageId) {
			return;
		}

		return mediaService.getImage(repositoryImageId);
	}, [repositoryImageId]);

	const fetchData = useCallback(async () => {
		setImageDetails(undefined);

		if (!request) {
			return;
		}

		const response = await request.fetch();
		setImageDetails(response);
	}, [request]);

	const displayImage = useMemo(() => {
		if (!imageDetails || imageDetails.image.imageId !== repositoryImageId) {
			return;
		}

		return getImageVariantForRatio(imageDetails.variants, cropRatio);
	}, [cropRatio, imageDetails, repositoryImageId]);

	useEffect(() => {
		onRepositoryImageVariantAvailabilityChange?.(!!displayImage);
	}, [displayImage, onRepositoryImageVariantAvailabilityChange]);

	const handleRecrop = useCallback(() => {
		if (!imageDetails) {
			return;
		}

		onRepositoryImageRecrop?.(
			{
				imageName: imageDetails.image.filename,
				imageUrl: imageDetails.image.url,
				imageAltText: imageDetails.image.imageAltText ?? '',
				sourceImageId: imageDetails.image.imageId,
			},
			cropRatio
		);
	}, [cropRatio, imageDetails, onRepositoryImageRecrop]);

	if (!repositoryImageId) {
		return null;
	}

	return (
		<AsyncWrapper
			fetchData={fetchData}
			abortFetch={request?.abort}
			loadingComponent={
				<div className={classes.loadingState}>
					<Loader className="position-static d-inline-flex" />
				</div>
			}
		>
			{imageDetails && (
				<div className={classes.selectedImageScreen}>
					<div className={classes.imagePanel}>
						<div className={classes.imagePanelHeader}>
							<div className={classes.ratioControls}>
								<p className="mb-0 text-muted fw-bold text-uppercase">Ratio:</p>
								{Object.values(IMAGE_REPOSITORY_CROP_RATIO).map((ratio) => (
									<Form.Check
										key={ratio}
										inline
										className={classes.ratioOption}
										type="radio"
										name="image-repository-selected-image-ratio"
										id={`image-repository-selected-image-ratio-${ratio}`}
										label={<span className="fs-large fw-semibold">{ratio}</span>}
										checked={cropRatio === ratio}
										onChange={() => {
											setCropRatio(ratio);
										}}
									/>
								))}
							</div>
							<Button variant="outline-primary" type="button" onClick={handleRecrop}>
								Re-crop {cropRatio}
							</Button>
						</div>
						<div className={classes.imagePreviewOuter}>
							{displayImage?.url ? (
								<div className={classes.imagePreview}>
									<img
										className={classes.imagePreviewImage}
										src={displayImage.url}
										alt={imageDetails.image.imageAltText ?? imageDetails.image.filename}
									/>
								</div>
							) : (
								<NoData
									title={`No ${cropRatio} image available`}
									description="This image has not been cropped to the selected ratio yet."
									actions={[]}
								/>
							)}
						</div>
					</div>
					<div className={classes.metadataPanel}>
						<h3 className="mb-4 fs-default fw-semibold">Image Metadata</h3>
						<InlineAlert
							className="mb-4"
							variant="warning"
							title="Updating this information will update it everywhere the image is used on Cobalt"
						/>
						<InputHelper
							className="mb-4"
							required
							label="Image Name"
							value={imageDetails.image.filename}
							readOnly
						/>
						<InputHelper
							as="textarea"
							label="Image alt text"
							placeholder="Describe the image for screen readers"
							value={imageDetails.image.imageAltText ?? ''}
							readOnly
						/>
						<h3 className="mt-7 mb-4 fs-default fw-semibold">Where is this image used?</h3>
						<p className="mb-0 text-muted">Usage data is not available yet.</p>
					</div>
				</div>
			)}
		</AsyncWrapper>
	);
};

export default ImageRepositorySelectedImage;
