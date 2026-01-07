import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { SkeletonImage, SkeletonText } from './skeleton-loaders';

const useStyles = createUseThemedStyles((theme) => ({
	headerImg: {
		borderRadius: 8,
	},
}));

interface PageHeaderProps {
	title: ReactNode;
	descriptionHtml?: string;
	imageUrl?: string;
	imageAlt?: string;
	className?: string;
	ctaButton?: {
		title: string;
		onClick(): void;
	};
}

const PageHeader = ({ title, descriptionHtml, imageUrl, imageAlt, className, ctaButton }: PageHeaderProps) => {
	const classes = useStyles();

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

						{ctaButton && (
							<div className="mt-10">
								<Button variant="light" onClick={ctaButton.onClick}>
									Subscribe
								</Button>
							</div>
						)}
					</Col>

					{imageUrl && (
						<Col xs={12} lg={{ offset: 1, span: 5 }} className="d-flex mt-12 mt-lg-0">
							<img
								className={classNames(classes.headerImg, 'w-100 align-self-center')}
								src={imageUrl}
								alt={imageAlt}
							/>
						</Col>
					)}
				</Row>
			</Container>
		</Container>
	);
};

export const PageHeaderSkeleton = ({ className }: { className: string }) => {
	return (
		<Container fluid className={classNames(className, 'p-5 p-lg-16')}>
			<Container>
				<Row>
					<Col xs={12} md={8}>
						<SkeletonText type="h1" numberOfLines={1} />
						<SkeletonText type="p" numberOfLines={3} />
					</Col>

					<Col xs={12} md={4}>
						<SkeletonImage height={200} />
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default PageHeader;
