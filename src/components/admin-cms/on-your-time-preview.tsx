import React, { FC, useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

import ReactPlayer from 'react-player';
import BackgroundImageContainer from '@/components/background-image-container';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';
import CircleIndicator from '@/components/admin-cms/circle-indicator';

const useOnYourTimePreviewStyles = createUseThemedStyles((theme) => ({
	mediaContainer: {
		paddingBottom: '56.25%',
	},
	mediaContent: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		padding: '15px 20px',
		position: 'absolute',
	},
	informationContainer: {
		color: theme.colors.dark,
		padding: '5px 10px',
		backgroundColor: theme.colors.white,
	},
	bordered: {
		border: `1px solid ${theme.colors.border}`,
		position: 'relative',
	},
	circleOne: {
		top: 3,
		left: -18,
		zIndex: 1,
		position: 'absolute',
	},
	circleTwo: {
		top: 0,
		left: -18,
		zIndex: 1,
		position: 'absolute',
	},
	circleThree: {
		top: -2,
		left: -18,
		zIndex: 1,
		position: 'absolute',
	},
	circleFour: {
		top: -2,
		right: -18,
		zIndex: 1,
		position: 'absolute',
	},
	circleFive: {
		top: 5,
		right: -8,
		zIndex: 1,
		position: 'absolute',
	},
	circleSix: {
		top: 10,
		left: -8,
		zIndex: 1,
		position: 'absolute',
	},
	descriptionOuter: {
		overflow: 'visible !important',
		backgroundColor: theme.colors.background,
	},
}));

interface OnYourTimePreviewProps {
	imageUrl?: string;
	url?: string;
	description: string;
	tag?: string;
	title: string;
	author: string;
	duration?: string;
	contentTypeLabel?: string;
}

const OnYourTimePreview: FC<OnYourTimePreviewProps> = (props) => {
	const classes = useOnYourTimePreviewStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [canEmbed, setCanEmbed] = useState(false);
	const { fonts } = useCobaltTheme();

	useEffect(() => {
		if (!props.url) {
			setCanEmbed(false);
			return;
		}

		setCanEmbed(ReactPlayer.canPlay(props.url));
	}, [props.url]);

	return (
		<Card className="border-0 p-6">
			<h5>Resource Post Example</h5>
			<div className="mb-5">This is an example of how your post will appear on the site.</div>
			<div className={classes.bordered}>
				<Container fluid className="overflow-visible">
					<Row>
						<Col xs={{ span: 12 }}>
							<div>
								<div className="position-relative">
									{canEmbed ? (
										<ReactPlayer width="100%" height="160px" url={props?.url} onPlay={() => {}} />
									) : (
										<BackgroundImageContainer
											className={classes.mediaContainer}
											imageUrl={props?.imageUrl || placeholderImage}
										/>
									)}
									<CircleIndicator size={16} className={classes.circleFive}>
										5
									</CircleIndicator>
								</div>
								<div className={classes.informationContainer}>
									{props?.title && (
										<div
											className="position-relative mb-0"
											style={{ ...fonts.xxs, ...fonts.primaryBold }}
										>
											<CircleIndicator size={16} className={classes.circleTwo}>
												2
											</CircleIndicator>
											{props.title}
										</div>
									)}
									{props?.author ? (
										<p className=" position-relative mb-1" style={{ ...fonts.xxxs }}>
											<CircleIndicator size={16} className={classes.circleThree}>
												3
											</CircleIndicator>
											by {props?.author}
										</p>
									) : (
										<p className="mb-1">&nbsp;</p>
									)}

									<div className="d-flex">
										<div className="position-relative">
											{props?.contentTypeLabel && (
												<span
													className="text-muted text-uppercase font-secondary-bold"
													style={{ ...fonts.xxxs }}
												>
													<CircleIndicator size={16} className={classes.circleOne}>
														1
													</CircleIndicator>
													{props.contentTypeLabel}
												</span>
											)}
										</div>

										{props?.duration && (
											<span
												className="position-relative text-muted text-uppercase font-secondary-bold ml-auto "
												style={{ ...fonts.xxxs, whiteSpace: 'nowrap' }}
											>
												<CircleIndicator size={16} className={classes.circleFour}>
													4
												</CircleIndicator>
												{props?.duration}
											</span>
										)}
									</div>
								</div>
							</div>
						</Col>
					</Row>
				</Container>

				<Container fluid className={classes.descriptionOuter}>
					<Row>
						<Col xs={{ span: 12 }}>
							{props?.description && (
								<div className="position-relative p-2">
									<CircleIndicator size={16} className={classes.circleSix}>
										6
									</CircleIndicator>
									<p
										className="mb-0"
										style={{ ...fonts.xxs }}
										dangerouslySetInnerHTML={{ __html: props.description || '' }}
									/>
								</div>
							)}
						</Col>
					</Row>

					{!canEmbed && props?.url && (
						<Row className="mt-2 text-center">
							<Col xs={{ span: 12 }}>
								<div style={{ transform: 'scale(0.6)' }}>
									<Button
										as="a"
										className="d-inline-block"
										variant="primary"
										href={props.url}
										target="_blank"
										onClick={() => {}}
									>
										{'call to action'}
									</Button>
								</div>
							</Col>
						</Row>
					)}
				</Container>
			</div>
		</Card>
	);
};

export default OnYourTimePreview;
