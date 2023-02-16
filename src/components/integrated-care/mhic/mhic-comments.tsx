import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { MhicComment } from '@/components/integrated-care/mhic';

export const MhicComments = () => {
	return (
		<>
			<section className="border-0">
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
			</section>
		</>
	);
};
