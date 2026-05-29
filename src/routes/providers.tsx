import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult from '@/components/provider-search-result';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();
	const [showProviderCanvas, setShowProviderCanvas] = useState(false);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Providers</title>
			</Helmet>

			<PreviewCanvas
				title={'Provider title'}
				show={showProviderCanvas}
				onHide={() => {
					setShowProviderCanvas(false);
				}}
			/>

			<Container className="pt-10 pb-16">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-2">Providers</h2>
						<p className="mb-6">
							Provider offerings may vary. Select your employer to see available providers and
							appointments.
						</p>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6 mb-lg-8">
					<Col>
						<div className="d-flex">
							<InputHelper
								className="me-6"
								as="select"
								label="Care Type"
								value={''}
								onChange={({ currentTarget }) => {
									return currentTarget;
								}}
							>
								<option value="" disabled>
									Select...
								</option>
							</InputHelper>
							<InputHelper
								as="select"
								label="Employer"
								value={''}
								onChange={({ currentTarget }) => {
									return currentTarget;
								}}
							>
								<option value="" disabled>
									Select...
								</option>
							</InputHelper>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<p className="mb-6 mb-lg-10">
							<strong>4 available _ for _ employees</strong>
						</p>
						<ProviderSearchResult
							onTitleButtonClick={() => {
								setShowProviderCanvas(true);
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
