import React, { useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import useAccount from '@/hooks/use-account';

export const Component = () => {
	const { institution } = useAccount();
	const editorRef = useRef<TinyMCEEditor | null>(null);

	const log = () => {
		console.log(editorRef.current?.getContent());
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
								'help',
								'wordcount',
							],
							toolbar:
								'undo redo | blocks | ' +
								'bold italic forecolor | alignleft aligncenter ' +
								'alignright alignjustify | bullist numlist outdent indent | ' +
								'removeformat | help',
							content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
						}}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Button onClick={log}>Log editor content</Button>
				</Col>
			</Row>
		</Container>
	);
};
