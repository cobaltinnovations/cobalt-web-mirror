import { PresignedUploadModel } from '@/lib/models';

interface ImageUploadShape {
	start: () => this;
	onBeforeUpload: (callback: (previewImageUrl: string) => void) => this;
	onPresignedUploadObtained: (callback: (accessUrl: string) => void) => this;
	onProgress: (callback: (percentage: number) => void) => this;
	onComplete: (callback: (finalImageUrl: string) => void) => this;
	onError: (callback: (error: any) => void) => this;
}

const maxFileSizeInBytes = 3000000; // 3mb;

export const imageUploader = (
	blob: Blob,
	presignedUploadGetter: () => Promise<{ presignedUpload: PresignedUploadModel }>
) => {
	let onPresignedUploadObtainedCallback: (accessUrl: string) => void;
	let onProgressCallback: (percentage: number) => void;
	let onCompleteCallback: (finalImageUrl: string) => void;
	let onErrorCallback: (error: any) => void;

	const imageUpload: ImageUploadShape = {
		onBeforeUpload: (callback: (previewImageUrl: string) => void) => {
			callback(URL.createObjectURL(blob));
			return imageUpload;
		},
		onPresignedUploadObtained: (callback) => {
			onPresignedUploadObtainedCallback = callback;
			return imageUpload;
		},
		onProgress: (callback) => {
			onProgressCallback = callback;
			return imageUpload;
		},
		onComplete: (callback) => {
			onCompleteCallback = callback;
			return imageUpload;
		},
		onError: (callback) => {
			onErrorCallback = callback;
			return imageUpload;
		},
		start: () => {
			new Promise((_resolve, reject) => {
				if (blob.size > maxFileSizeInBytes) {
					reject({
						code: 'FILE_SIZE_LIMIT_EXCEEDED',
						message: 'File size exceeds limit of 3mb.',
					});
				}
			})
				.then(() => {
					return presignedUploadGetter();
				})
				.then(({ presignedUpload }) => {
					onPresignedUploadObtainedCallback(presignedUpload.accessUrl);

					return new Promise((resolve: (accessUrl: string) => void, reject) => {
						const xhr = new XMLHttpRequest();

						xhr.upload.addEventListener('progress', (event) => {
							if (event.lengthComputable) {
								const percentCompleted = Math.round((event.loaded * 100) / event.total);
								onProgressCallback(percentCompleted);
							}
						});

						xhr.addEventListener('load', () => {
							resolve(presignedUpload.accessUrl);
						});

						xhr.addEventListener('error', () => {
							reject({
								code: 'UPLOAD_ERROR',
								message: 'There was an error uploading your image.',
							});
						});

						xhr.addEventListener('abort', () => {
							reject({
								code: 'UPLOAD_ABORTED',
								message: 'The image upload was aborted.',
							});
						});

						xhr.open(presignedUpload.httpMethod, presignedUpload.url, true);

						for (let httpHeaderName in presignedUpload.httpHeaders) {
							xhr.setRequestHeader(httpHeaderName, presignedUpload.httpHeaders[httpHeaderName]);
						}

						xhr.send(blob);
					});
				})
				.then((accessUrl) => {
					onCompleteCallback(accessUrl);
				})
				.catch((error) => {
					onErrorCallback(error);
				});

			return imageUpload;
		},
	};

	return imageUpload;
};
