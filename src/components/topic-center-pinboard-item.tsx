import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	topicCenterPinboard: {
		padding: 20,
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		boxShadow: '0px 3px 5px rgba(41, 40, 39, 0.2), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		[mediaQueries.lg]: {
			padding: 0,
			borderRadius: 0,
			boxShadow: 'none',
			flexDirection: 'column',
			borderBottom: `1px solid ${theme.colors.border}`,
			'&:first-of-type': {
				borderTop: `1px solid ${theme.colors.border}`,
			},
		},
	},
	imageOuter: {
		width: 80,
		height: 80,
		flexShrink: 0,
		borderRadius: 4,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
	},
	moreButton: {
		padding: 0,
		flexShrink: 0,
		marginLeft: 24,
		textDecoration: 'none',
		color: theme.colors.n500,
		...theme.fonts.bodyNormal,
		'&:hover': {
			color: theme.colors.n500,
		},
	},
	informationOuter: {
		'& h5 a': {
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline',
			},
		},
		[mediaQueries.lg]: {
			padding: '16px 0',
		},
	},
	description: {
		'& p': {
			margin: 0,
		},
		'& a': {
			...theme.fonts.bodyNormal,
		},
	},
}));

interface Props {
	title: string;
	description: string;
	url: string;
	imageUrl?: string;
	className?: string;
}

const ResponsiveEllipsis = responsiveHOC()(HTMLEllipsis);

export const TopicCenterPinboardItem = ({ title, description, url, imageUrl, className }: Props) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [isClamped, setIsClamped] = useState(false);

	const setClamp = () => {
		if (window.innerWidth >= 992) {
			setIsClamped(false);
		} else {
			setIsClamped(true);
		}
	};

	const handleWindowResize = debounce(setClamp, 200);

	useEffect(() => {
		setClamp();
	}, []);

	useEffect(() => {
		window.addEventListener('resize', handleWindowResize);
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

	return (
		<div className={classNames(classes.topicCenterPinboard, className)}>
			<div
				className={classNames(classes.imageOuter, 'd-none d-lg-block')}
				style={{ backgroundImage: `url(${imageUrl ? imageUrl : placeholderImage})` }}
			/>
			<div className={classes.informationOuter}>
				<Container>
					<Row>
						<Col>
							<div className="d-flex align-items-start justify-content-between">
								<h5 className="mb-2">
									<a href={url} target="_blank" rel="noreferrer">
										{title}
									</a>
								</h5>
								<Button
									variant="link"
									className={classNames(classes.moreButton, 'd-lg-none')}
									onClick={() => {
										setIsClamped(!isClamped);
									}}
								>
									{isClamped ? 'More +' : 'Less -'}
								</Button>
							</div>
							<ResponsiveEllipsis
								className={classes.description}
								unsafeHTML={description}
								maxLine={isClamped ? '2' : '10000'}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};
