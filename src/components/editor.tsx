import React, { useCallback, useRef } from 'react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Editor as EditorComponent } from '@tinymce/tinymce-react';

import { GetPreSignedUploadUrlRequestBody, imageUploader } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import { OrchestratedRequest } from '@/lib/http-client';
import { PresignedUploadResponse } from '@/lib/models';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	editorOuter: {
		zIndex: 0,
		position: 'relative',
	},
});

interface EditorProps {
	initialValue: string;
	value: string;
	onChange(value: string): void;
	presignedUrlEndpoint: (data: GetPreSignedUploadUrlRequestBody) => OrchestratedRequest<PresignedUploadResponse>;
}

const Editor = ({ initialValue, value, onChange, presignedUrlEndpoint }: EditorProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { institution } = useAccount();
	const editorRef = useRef<TinyMCEEditor | null>(null);

	const handleImageUpload = useCallback(
		(file: Blob, filename: string, progressFn: (percent: number) => void) => {
			return new Promise((resolve: (accessUrl: string) => void, reject) => {
				imageUploader(
					file,
					presignedUrlEndpoint({
						contentType: file.type,
						filename: filename,
						filesize: file.size,
					}).fetch
				)
					.onPresignedUploadObtained(() => {})
					.onProgress((percentage) => {
						progressFn(percentage);
					})
					.onComplete((finalImageUrl) => {
						resolve(finalImageUrl);
					})
					.onError((error) => {
						handleError(error);
						reject(error);
					})
					.start();
			});
		},
		[handleError, presignedUrlEndpoint]
	);

	return (
		<div className={classes.editorOuter}>
			<EditorComponent
				apiKey={institution.tinymceApiKey}
				onInit={(_evt, editor) => (editorRef.current = editor)}
				initialValue={initialValue}
				value={value}
				onEditorChange={(newValue, _editor) => {
					onChange(newValue);
				}}
				init={{
					height: 500,
					menubar: false,
					plugins: [
						'image',
						'advlist',
						'autolink',
						'lists',
						'link',
						'image',
						'charmap',
						'preview',
						'anchor',
						'searchreplace',
						'visualblocks',
						'code',
						'fullscreen',
						'insertdatetime',
						'media',
						'table',
						'code',
						// 'help',
						'wordcount',
					],
					toolbar:
						'undo redo | blocks | ' +
						'bold italic underline | ' +
						'alignleft aligncenter alignright | ' +
						'bullist numlist | ' +
						'removeformat | ' +
						'link image',
					content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
					automatic_uploads: true,
					images_file_types: 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp',
					file_picker_types: 'image',
					block_unsupported_drop: true,
					file_picker_callback: (callback) => {
						const input = document.createElement('input');
						input.setAttribute('type', 'file');
						input.setAttribute('accept', 'image/*');
						input.addEventListener('change', (event) => {
							const file = (event.target as HTMLInputElement)?.files?.[0];

							if (!file) {
								return;
							}

							const reader = new FileReader();

							reader.addEventListener('load', () => {
								if (!editorRef.current) {
									return;
								}

								const id = `blobid${new Date().getTime()}`;
								const blobCache = editorRef.current.editorUpload.blobCache;
								const base64 = String(reader.result).split(',')[1];
								const blobInfo = blobCache.create(id, file, base64);

								blobCache.add(blobInfo);

								callback(blobInfo.blobUri(), {
									title: file.name,
								});
							});

							reader.readAsDataURL(file);
						});

						input.click();
					},
					images_upload_handler: async (blobInfo, progressFn) => {
						const locationUrl = await handleImageUpload(blobInfo.blob(), blobInfo.filename(), progressFn);

						return locationUrl;
					},
					images_reuse_filename: true,
					setup: (editor) => {
						editor.on('focus', () => {
							editor.dom.setAttrib(editor.dom.select('img'), 'height', 'auto');
							editor.dom.setAttrib(editor.dom.select('img'), 'width', '100%');
						});
					},
					object_resizing: false,
				}}
			/>
		</div>
	);
};

export default Editor;
