import type { ImageModel } from '@/lib/models';

import { getPageBuilderImageAssociationRequest } from './page-builder-image';

it('uses image IDs for repository-enabled institutions, including clearing', () => {
	expect(
		getPageBuilderImageAssociationRequest(
			{ image: { imageId: 'image-id' } as ImageModel, imageFileUploadId: 'legacy-id' },
			true
		)
	).toEqual({ imageId: 'image-id' });
	expect(getPageBuilderImageAssociationRequest({ imageFileUploadId: 'legacy-id' }, true)).toEqual({
		imageId: undefined,
	});
});

it('uses file-upload IDs for institutions on the legacy uploader', () => {
	expect(getPageBuilderImageAssociationRequest({ imageFileUploadId: 'legacy-id' }, false)).toEqual({
		imageFileUploadId: 'legacy-id',
	});
});
