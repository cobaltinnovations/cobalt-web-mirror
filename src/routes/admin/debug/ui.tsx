import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import useFlags from '@/hooks/use-flags';
import SentryDebugButtons from '@/components/sentry-debug-buttons';
import Breadcrumb from '@/components/breadcrumb';

export async function loader() {
	return null;
}

export const Component = () => {
	const { addFlag } = useFlags();

	return (
		<>
			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/admin',
						title: 'Admin',
					},
					{
						to: '/admin/debug',
						title: 'Debug',
					},
					{
						to: '/admin/debug/ui',
						title: 'UI',
					},
				]}
			/>

			<Container className="py-10">
				<Row>
					<Col>
						<h3 className="mb-2">Flag Debug UI</h3>
					</Col>
				</Row>
				<Row className="mb-2">
					<Col>
						<Button
							variant="outline-primary"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'primary',
									title: 'Regular news, everyone',
									description: 'Nothing to worry about, everything is pretty normal!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No thanks',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Primary Flag
						</Button>
						<Button
							variant="outline-success"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'success',
									title: 'Good news, everyone',
									description: 'Nothing to worry about, everything is going great!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No thanks',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Success Flag
						</Button>
						<Button
							variant="outline-warning"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'warning',
									title: 'Cautionary news, everyone',
									description: 'Maybe something worry about, everything is sort of falling apart!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No thanks',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Warning Flag
						</Button>
						<Button
							variant="outline-danger"
							onClick={() => {
								addFlag({
									variant: 'danger',
									title: 'Bad news, everyone',
									description: 'Definitely should worry, everthing is broken!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No thanks',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Danger Flag
						</Button>
					</Col>
				</Row>
				<Row>
					<Col>
						<Button
							variant="primary"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'bold-primary',
									title: 'Hey, did you know...',
									description: 'This alert needs your attention, but its not super important.',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No way!',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Bold Primary Flag
						</Button>
						<Button
							variant="success"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'bold-success',
									title: 'Your action was successful!',
									description: 'Nothing to worry about, everything is going great!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No way!',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Bold Success Flag
						</Button>
						<Button
							variant="warning"
							className="me-2"
							onClick={() => {
								addFlag({
									variant: 'bold-warning',
									title: 'Uh oh!',
									description: 'Pay attention to me, things are not going according to plan.',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No way!',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Bold Warning Flag
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								addFlag({
									variant: 'bold-danger',
									title: "Can't connect",
									description: 'You need to take action, something has gone terribly wrong!',
									actions: [
										{
											title: 'Understood',
											onClick: () => {
												return;
											},
										},
										{
											title: 'No way!',
											onClick: () => {
												return;
											},
										},
									],
								});
							}}
						>
							Bold Danger Flag
						</Button>
					</Col>
				</Row>
				<Row>
					<Col>
						<SentryDebugButtons />
					</Col>
				</Row>
			</Container>
		</>
	);
};
