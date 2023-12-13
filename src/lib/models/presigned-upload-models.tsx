import { Method } from 'axios';

export interface PresignedUploadModel {
	accessUrl: string;
	contentType: string;
	expirationTimestamp: string;
	expirationTimestampDescription: string;
	httpHeaders: Record<string, string>;
	httpMethod: Method;
	url: string;
}

export interface PresignedUploadResponse {
	fileUploadResult: {
		fileUploadId: string;
		presignedUpload: PresignedUploadModel;
	};
}
