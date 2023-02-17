import React from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { MhicComment } from '@/components/integrated-care/mhic';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	comments: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	commentList: {
		flex: 1,
		padding: 32,
		overflowY: 'auto',
	},
	inputOuter: {
		padding: 32,
		boxShadow: '0px -4px 8px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		backgroundColor: theme.colors.n0,
	},
}));

export const MhicComments = () => {
	const classes = useStyles();

	return (
		<div className={classes.comments}>
			<div className={classes.commentList}>
				<Container fluid className="overflow-visible">
					<Row>
						<Col>
							<MhicComment
								className="mb-4"
								name="Ava Williams"
								date="Nov 07, 2023 at 10:00AM"
								tag="Outreach"
								message="Called and scheduled the assessment for November 12."
								onEdit={() => {
									window.alert('[TODO]: Edit Comment');
								}}
								onDelete={() => {
									window.confirm('Are you sure?');
								}}
							/>
							<MhicComment
								className="mb-4"
								name="Thisisalongeruser Theyhavealongname"
								date="Nov 01, 2023 at 10:00AM"
								tag="General"
								message="Lorem ipsum dolor sit amet consectetur. Rutrum at sit semper tincidunt purus leo pellentesque adipiscing. Faucibus scelerisque eu viverra sed id enim feugiat morbi viverra. At venenatis eget et aliquet fermentum ornare. Fringilla condimentum sed cursus tincidunt vel interdum. Gravida augue vulputate platea blandit feugiat amet et donec."
								onEdit={() => {
									window.alert('[TODO]: Edit Comment');
								}}
								onDelete={() => {
									window.confirm('Are you sure?');
								}}
							/>
							<MhicComment
								name="Ava Williams"
								date="Sep 30, 2023 at 2:51PM"
								tag="Outreach"
								message="Called to do assessment, patient was unavailable, left a voicemail."
								onEdit={() => {
									window.alert('[TODO]: Edit Comment');
								}}
								onDelete={() => {
									window.confirm('Are you sure?');
								}}
							/>
						</Col>
					</Row>
				</Container>
			</div>
			<div className={classes.inputOuter}>
				<Form>
					<InputHelper className="mb-4" as="textarea" label="Comment" />
					<div className="text-right">
						<Button type="submit">Add Comment</Button>
					</div>
				</Form>
			</div>
		</div>
	);
};
