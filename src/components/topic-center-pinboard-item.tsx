import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import useAnalytics from '@/hooks/use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';
import { PinboardNoteModel, TopicCenterModel, TopicCenterRowModel } from '@/lib/models';

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
	topicCenter: TopicCenterModel;
	topicCenterRow: TopicCenterRowModel;
	pinboardNote: PinboardNoteModel;
	className?: string;
}

const ResponsiveEllipsis = responsiveHOC()(HTMLEllipsis);

export const TopicCenterPinboardItem = ({ topicCenter, topicCenterRow, pinboardNote, className }: Props) => {
	const classes = useStyles();
	const { mixpanel, trackEvent } = useAnalytics();
	const placeholderImage = useRandomPlaceholderImage();
	const [isClamped, setIsClamped] = useState(false);
	const dynamicContentRef = useRef<HTMLEllipsis>(null);

	const setClamp = useCallback(() => {
		if (window.innerWidth >= 992) {
			setIsClamped(false);
		} else {
			setIsClamped(true);
		}
	}, []);

	useEffect(() => {
		const handleWindowResize = debounce(setClamp, 200);
		window.addEventListener('resize', handleWindowResize);

		setClamp();
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [setClamp]);

	useEffect(() => {
		if (!dynamicContentRef.current) {
			return;
		}

		function handleDynamicLinkClick(e: MouseEvent) {
			const linkEl = e.target as HTMLAnchorElement;

			if (!linkEl) {
				return;
			}

			const eventLabel = `topicCenterTitle:${topicCenter.name}, sectionTitle:${topicCenterRow.title}, cardTitle:${pinboardNote.title}, url:${linkEl.href}`;
			trackEvent(TopicCenterAnalyticsEvent.clickPinboardNote(eventLabel));

			mixpanel.track('Topic Center Pinboard Item Content Link Click', {
				'Topic Center ID': topicCenter.topicCenterId,
				'Topic Center Title': topicCenter.name,
				'Section Title': topicCenterRow.title,
				'Pinboard Item ID': pinboardNote.pinboardNoteId,
				'Pinboard Item Title': pinboardNote.title,
				'Pinboard Item Content Link': pinboardNote.url,
			});
		}

		//@ts-expect-error ref type
		const noteContentWrapper: HTMLDivElement = dynamicContentRef.current.target;
		const linkElements = noteContentWrapper.querySelectorAll<HTMLAnchorElement>('a[href]');

		for (const linkElement of linkElements) {
			linkElement.addEventListener('click', handleDynamicLinkClick);
		}

		return () => {
			for (const linkElement of linkElements) {
				linkElement.removeEventListener('click', handleDynamicLinkClick);
			}
		};
	}, [
		mixpanel,
		pinboardNote.pinboardNoteId,
		pinboardNote.title,
		pinboardNote.url,
		topicCenter.name,
		topicCenter.topicCenterId,
		topicCenterRow.title,
		trackEvent,
	]);

	return (
		<div className={classNames(classes.topicCenterPinboard, className)}>
			<div
				className={classNames(classes.imageOuter, 'd-none d-lg-block')}
				style={{ backgroundImage: `url(${pinboardNote.imageUrl ? pinboardNote.imageUrl : placeholderImage})` }}
			/>
			<div className={classes.informationOuter}>
				<Container>
					<Row>
						<Col>
							<div className="d-flex align-items-start justify-content-between">
								<h5 className="mb-2">
									<a
										href={pinboardNote.url}
										target="_blank"
										rel="noreferrer"
										onClick={() => {
											const eventLabel = `topicCenterTitle:${topicCenter.name}, sectionTitle:${topicCenterRow.title}, cardTitle:${pinboardNote.title}, url:${pinboardNote.url}`;

											trackEvent(TopicCenterAnalyticsEvent.clickPinboardNote(eventLabel));

											mixpanel.track('Topic Center Pinboard Item Click', {
												'Topic Center ID': topicCenter.topicCenterId,
												'Topic Center Title': topicCenter.name,
												'Section Title': topicCenterRow.title,
												'Pinboard Item ID': pinboardNote.pinboardNoteId,
												'Pinboard Item Title': pinboardNote.title,
											});
										}}
									>
										{pinboardNote.title}
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
								//@ts-expect-error ref type
								innerRef={dynamicContentRef}
								className={classes.description}
								unsafeHTML={pinboardNote.description}
								maxLine={isClamped ? '2' : '10000'}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};
