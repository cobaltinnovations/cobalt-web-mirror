import React, { useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import useAccount from '@/hooks/use-account';

export const Component = () => {
	const { institution } = useAccount();
	const editorRef = useRef<TinyMCEEditor | null>(null);
	const [editorContent, setEditorContent] = useState('');

	const log = () => {
		setEditorContent(editorRef.current?.getContent() ?? '');
	};

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
								console.log('custom XHR stuff goes here...');
								console.log('images_upload_handler blobInfo', blobInfo);
								console.log('images_upload_handler progressFn', progressFn);
								return '';
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
