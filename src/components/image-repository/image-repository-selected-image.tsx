import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';

import AsyncWrapper from '@/components/async-page';
import InputHelper from '@/components/input-helper';
import Loader from '@/components/loader';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';
import {
	FILE_UPLOAD_TYPE_ID,
	mediaService,
	type ImageDetailModel,
	type ImageModel,
} from '@/lib/services/media-service';

import { IMAGE_REPOSITORY_CROP_RATIO, ImageRepositoryScreenProps } from './image-repository.types';

interface CropRatioConfig {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
}

const cropRatioConfigByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, CropRatioConfig> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: {
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: {
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: {
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
	},
};

const useStyles = createUseThemedStyles((theme) => ({
	selectedImageScreen: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) 320px',
		height: 575,
	},
	imagePanel: {
		minWidth: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '32px',
		borderRight: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.background,
	},
	imagePreviewFrame: {
		width: '100%',
		maxHeight: '100%',
		aspectRatio: '16 / 9',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imagePreviewImage: {
		display: 'block',
		maxWidth: '100%',
		maxHeight: '100%',
		objectFit: 'contain',
	},
	metadataPanel: {
		display: 'flex',
		flexDirection: 'column',
		padding: 24,
		backgroundColor: theme.colors.n0,
		overflowY: 'auto',
	},
	metadataActions: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginTop: 'auto',
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
	return variants.find(
		(variant) => variant.fileUploadTypeId === cropRatioConfigByCropRatio[cropRatio].fileUploadTypeId
	);
}

function getSourceImageFromDetails(imageDetails: ImageDetailModel): ImageModel {
	if (imageDetails.image.fileUploadTypeId === FILE_UPLOAD_TYPE_ID.IMAGE_RAW) {
		return imageDetails.image;
	}

	return (
		imageDetails.variants.find((variant) => variant.fileUploadTypeId === FILE_UPLOAD_TYPE_ID.IMAGE_RAW) ??
		imageDetails.image
	);
}

type ImageRepositorySelectedImageProps = Pick<
	ImageRepositoryScreenProps,
	'onRepositoryImageEdit' | 'onRepositoryImageVariantAvailabilityChange' | 'repositoryImageId'
>;

const ImageRepositorySelectedImage: FC<ImageRepositorySelectedImageProps> = ({
	onRepositoryImageEdit,
	onRepositoryImageVariantAvailabilityChange,
	repositoryImageId,
}) => {
	const [cropRatio, setCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
	const [imageDetails, setImageDetails] = useState<ImageDetailModel>();
	const classes = useStyles();

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
	const selectedImageMetadata = displayImage ?? imageDetails?.image;

	useEffect(() => {
		onRepositoryImageVariantAvailabilityChange?.(!!displayImage);
	}, [displayImage, onRepositoryImageVariantAvailabilityChange]);

	const getSelectedImageForEdit = useCallback(
		(nextCropRatio: IMAGE_REPOSITORY_CROP_RATIO) => {
			if (!imageDetails) {
				return;
			}

			const nextImageVariant = getImageVariantForRatio(imageDetails.variants, nextCropRatio);
			const sourceImage = getSourceImageFromDetails(imageDetails);

			return {
				imageName: nextImageVariant?.filename ?? sourceImage.filename,
				imageUrl: sourceImage.url,
				imageAltText: nextImageVariant?.imageAltText ?? sourceImage.imageAltText ?? '',
				sourceImageId: sourceImage.imageId,
				createdDescription: nextImageVariant?.createdDescription,
				isCreatingMissingVariant: !nextImageVariant,
			};
		},
		[imageDetails]
	);

	const handleCropRatioChange = useCallback(
		(nextCropRatio: IMAGE_REPOSITORY_CROP_RATIO) => {
			if (!imageDetails) {
				return;
			}

			const nextImageVariant = getImageVariantForRatio(imageDetails.variants, nextCropRatio);

			if (!nextImageVariant) {
				const selectedImageForEdit = getSelectedImageForEdit(nextCropRatio);

				if (selectedImageForEdit) {
					onRepositoryImageEdit?.(selectedImageForEdit, nextCropRatio);
				}

				return;
			}

			setCropRatio(nextCropRatio);
		},
		[getSelectedImageForEdit, imageDetails, onRepositoryImageEdit]
	);

	const handleEdit = useCallback(() => {
		const selectedImageForEdit = getSelectedImageForEdit(cropRatio);

		if (!selectedImageForEdit) {
			return;
		}

		onRepositoryImageEdit?.(selectedImageForEdit, cropRatio);
	}, [cropRatio, getSelectedImageForEdit, onRepositoryImageEdit]);

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
						{displayImage?.url ? (
							<div className={classes.imagePreviewFrame}>
								<img
									className={classes.imagePreviewImage}
									src={displayImage.url}
									alt={
										displayImage.imageAltText ??
										imageDetails.image.imageAltText ??
										imageDetails.image.filename
									}
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
					<div className={classes.metadataPanel}>
						<InputHelper
							className="mb-4"
							label="Image Ratio:"
							as="select"
							value={cropRatio}
							onChange={({ currentTarget }) => {
								handleCropRatioChange(currentTarget.value as IMAGE_REPOSITORY_CROP_RATIO);
							}}
						>
							{Object.values(IMAGE_REPOSITORY_CROP_RATIO).map((ratio) => (
								<option key={ratio} value={ratio}>
									{ratio}
								</option>
							))}
						</InputHelper>
						<p className="mb-4 fs-large fw-semibold">{cropRatio} Image Metadata</p>
						{selectedImageMetadata?.createdDescription && (
							<p className="mb-4 text-muted">Created {selectedImageMetadata.createdDescription}</p>
						)}
						<InputHelper
							className="mb-4"
							required
							label="Name"
							value={selectedImageMetadata?.filename ?? ''}
							readOnly
							disabled
						/>
						<InputHelper
							className="mb-4"
							as="textarea"
							label="Image alt text"
							placeholder="Describe the image for screen readers"
							value={selectedImageMetadata?.imageAltText ?? ''}
							readOnly
							disabled
						/>
						<h3 className="mb-4 fs-default fw-semibold">Where is this image used?</h3>
						<p className="mb-0 text-muted">Usage data is not available yet.</p>
						<div className={classes.metadataActions}>
							<Button variant="outline-primary" type="button" onClick={handleEdit}>
								<SvgIcon kit="far" icon="pen" size={16} className="me-2" />
								Edit {cropRatio} Image
							</Button>
						</div>
					</div>
				</div>
			)}
		</AsyncWrapper>
	);
};

export default ImageRepositorySelectedImage;
