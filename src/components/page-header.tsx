import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

interface PageHeaderProps {
	title: ReactNode;
	descriptionHtml?: string;
	imageUrl?: string;
	imageAlt?: string;
	className?: string;
}

const PageHeader = ({ title, descriptionHtml, imageUrl, imageAlt, className }: PageHeaderProps) => {
	return (
		<Container fluid className={classNames('p-5 p-lg-16', className)}>
			<Container>
				<Row>
					<Col>
						<div className="mb-6">{title}</div>

						{descriptionHtml && (
							<div
								dangerouslySetInnerHTML={{
									__html: descriptionHtml,
								}}
							/>
						)}
					</Col>

					{imageUrl && (
						<Col xs={12} lg={{ offset: 1, span: 5 }} className="d-flex mt-12 mt-lg-0">
							<img className="w-100 align-self-center" src={imageUrl} alt={imageAlt} />
						</Col>
					)}
				</Row>
			</Container>
		</Container>
	);
};

export default PageHeader;
