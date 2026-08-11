import type { ImageModel } from '@/lib/models';
import type { PageImageAssociationRequest } from '@/lib/services/pages-service';

export interface PageBuilderImageFormValue {
	image?: ImageModel;
	imageFileUploadId: string;
	imageUrl: string;
}

export const getPageBuilderImageAssociationRequest = (
	value: Pick<PageBuilderImageFormValue, 'image' | 'imageFileUploadId'>,
	imageRepositoryEnabled: boolean
): PageImageAssociationRequest =>
	imageRepositoryEnabled ? { imageId: value.image?.imageId } : { imageFileUploadId: value.imageFileUploadId };
