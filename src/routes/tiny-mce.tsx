import React, { useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

export const Component = () => {
	const editorRef = useRef<TinyMCEEditor | null>(null);

	const log = () => {
		if (editorRef.current) {
			console.log(editorRef.current.getContent());
		}
	};

	return (
		<Container>
			<Row className="py-5">
				<Col>
					<h1>Tiny MCE</h1>
				</Col>
			</Row>
			<Row>
				<Col>
					<Editor
						apiKey="xxx"
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
