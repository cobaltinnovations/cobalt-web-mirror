import React, { useCallback, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import useAccount from '@/hooks/use-account';
import { adminService, imageUploader } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

export const Component = () => {
	const { institution } = useAccount();
	const editorRef = useRef<TinyMCEEditor | null>(null);
	const [editorContent, setEditorContent] = useState('');

	const handleError = useHandleError();
	const [isUploading, setIsUploading] = useState(false);

	const log = () => {
		setEditorContent(editorRef.current?.getContent() ?? '');
	};

	const handleImageUpload = useCallback(
		(file: Blob, filename: string, progressFn: (percent: number) => void) => {
			return new Promise((resolve: (accessUrl: string) => void, reject) => {
				imageUploader(
					file,
					adminService.getPresignedUploadUrl({
						contentType: file.type,
						filename: filename,
						filesize: file.size,
					}).fetch
				)
					.onPresignedUploadObtained(({ fileUploadResult }) => {
						setIsUploading(true);
						resolve(fileUploadResult.presignedUpload.accessUrl);
					})
					.onProgress((percentage) => {
						progressFn(percentage);
					})
					.onComplete(() => {
						setIsUploading(false);
					})
					.onError((error) => {
						handleError(error);
						setIsUploading(false);
						reject(error);
					})
					.start();
			});
		},
		[handleError]
	);

	return (
		<Container>
			<Row className="py-5">
				<Col>
					<h1>Tiny MCE</h1>
				</Col>
			</Row>
			<Row className="mb-5">
				<Col>
					<Editor
						apiKey={institution.tinymceApiKey}
						onInit={(_evt, editor) => (editorRef.current = editor)}
						initialValue="<p>This is the initial content of the editor.</p>"
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
								const locationUrl = await handleImageUpload(
									blobInfo.blob(),
									blobInfo.filename(),
									progressFn
								);

								return locationUrl;
							},
							images_reuse_filename: true,
						}}
					/>
				</Col>
			</Row>
			<Row className="mb-5">
				<Col>
					<Button onClick={log}>Render editor content</Button>
				</Col>
			</Row>
			<Row>
				<Col>
					<pre>{editorContent}</pre>
				</Col>
			</Row>
		</Container>
	);
};
