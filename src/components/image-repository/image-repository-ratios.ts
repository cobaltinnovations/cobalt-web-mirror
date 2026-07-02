import { FILE_UPLOAD_TYPE_ID } from '@/lib/models';

export enum IMAGE_REPOSITORY_CROP_RATIO {
	SIXTEEN_NINE = '16:9',
	FOUR_THREE = '4:3',
	ONE_ONE = '1:1',
}

export type ImageRepositorySelectableCropFileUploadTypeId =
	| FILE_UPLOAD_TYPE_ID.IMAGE_4X3
	| FILE_UPLOAD_TYPE_ID.IMAGE_16X9
	| FILE_UPLOAD_TYPE_ID.IMAGE_1X1;

export interface ImageRepositoryCropRatioConfig {
	aspect: number;
	fileUploadTypeId: ImageRepositorySelectableCropFileUploadTypeId;
	thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	ratioDimensions: {
		width: number;
		height: number;
	};
	thumbnailWidth: number;
}

const defaultSelectableCropFileUploadTypeIds: ImageRepositorySelectableCropFileUploadTypeId[] = [
	FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
	FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
	FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
];

export const imageRepositoryCropRatioConfigByCropRatio: Record<
	IMAGE_REPOSITORY_CROP_RATIO,
	ImageRepositoryCropRatioConfig
> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: {
		aspect: 16 / 9,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_16X9,
		ratioDimensions: { width: 16, height: 9 },
		thumbnailWidth: 320,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: {
		aspect: 4 / 3,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_4X3,
		ratioDimensions: { width: 4, height: 3 },
		thumbnailWidth: 320,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: {
		aspect: 1,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_1X1,
		ratioDimensions: { width: 1, height: 1 },
		thumbnailWidth: 320,
	},
};

export const imageRepositoryCropRatioByFileUploadTypeId = Object.entries(
	imageRepositoryCropRatioConfigByCropRatio
).reduce((cropRatioByFileUploadTypeId, [cropRatio, cropRatioConfig]) => {
	cropRatioByFileUploadTypeId[cropRatioConfig.fileUploadTypeId] = cropRatio as IMAGE_REPOSITORY_CROP_RATIO;

	return cropRatioByFileUploadTypeId;
}, {} as Record<ImageRepositorySelectableCropFileUploadTypeId, IMAGE_REPOSITORY_CROP_RATIO>);

export function getImageRepositoryFileUploadTypeForCropRatio(
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO
): ImageRepositorySelectableCropFileUploadTypeId {
	return imageRepositoryCropRatioConfigByCropRatio[cropRatio].fileUploadTypeId;
}

export function getImageRepositoryCropRatioForFileUploadType(
	fileUploadTypeId: ImageRepositorySelectableCropFileUploadTypeId
): IMAGE_REPOSITORY_CROP_RATIO {
	return imageRepositoryCropRatioByFileUploadTypeId[fileUploadTypeId];
}

export function getAcceptableImageRepositoryCropRatios(
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO[] {
	const cropSizes =
		acceptableCropSizes && acceptableCropSizes.length > 0
			? acceptableCropSizes
			: defaultSelectableCropFileUploadTypeIds;

	return cropSizes.reduce((cropRatios, cropSize) => {
		const cropRatio = getImageRepositoryCropRatioForFileUploadType(cropSize);

		if (!cropRatios.includes(cropRatio)) {
			cropRatios.push(cropRatio);
		}

		return cropRatios;
	}, [] as IMAGE_REPOSITORY_CROP_RATIO[]);
}

export function getDefaultImageRepositoryCropRatio(
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO {
	const acceptableCropRatios = getAcceptableImageRepositoryCropRatios(acceptableCropSizes);

	if (acceptableCropRatios.includes(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE)) {
		return IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE;
	}

	return acceptableCropRatios[0] ?? IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE;
}

export function getResolvedImageRepositoryCropRatio(
	cropRatio?: IMAGE_REPOSITORY_CROP_RATIO,
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO {
	const acceptableCropRatios = getAcceptableImageRepositoryCropRatios(acceptableCropSizes);

	if (cropRatio && acceptableCropRatios.includes(cropRatio)) {
		return cropRatio;
	}

	return getDefaultImageRepositoryCropRatio(acceptableCropSizes);
}
