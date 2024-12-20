import React, { useEffect, useRef } from 'react';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';
import useAnalytics from '@/hooks/use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';
import { PinboardNoteModel, TopicCenterModel, TopicCenterRowModel } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	topicCenterPinboard: {
		borderRadius: 8,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
	},
	imageOuter: {
		width: '100%',
		height: 200,
		borderRadius: 8,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
	},
	informationOuter: {
		'& h5 a': {
			textDecoration: 'none',
			'&:hover': {
				textDecoration: 'underline',
			},
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
	onClick?: (url: string) => void;
	className?: string;
}

export const TopicCenterPinboardItem = ({ topicCenter, topicCenterRow, pinboardNote, onClick, className }: Props) => {
	const classes = useStyles();
	const { mixpanel, trackEvent } = useAnalytics();
	const placeholderImage = useRandomPlaceholderImage();

	const dynamicContentRef = useRef<HTMLEllipsis>(null);

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

	const handleDangerousHtmlClick = (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
		const { nativeEvent } = event;
		const clickedElement = nativeEvent.target;

		if (clickedElement instanceof HTMLElement) {
			const link = clickedElement.closest('a');

			if (link) {
				onClick?.(link.href);
			}
		}
	};

	return (
		<div className={classNames(classes.topicCenterPinboard, 'px-5 pt-5 pb-6', className)}>
			<div
				className={classNames(classes.imageOuter, 'mb-5')}
				style={{ backgroundImage: `url(${pinboardNote.imageUrl ? pinboardNote.imageUrl : placeholderImage})` }}
			/>
			<div className={classes.informationOuter}>
				<div className="d-flex align-items-start justify-content-between">
					<h5 className="mb-2">
						{pinboardNote.url ? (
							<a
								href={pinboardNote.url}
								target="_blank"
								rel="noreferrer"
								onClick={(event) => {
									const eventLabel = `topicCenterTitle:${topicCenter.name}, sectionTitle:${topicCenterRow.title}, cardTitle:${pinboardNote.title}, url:${pinboardNote.url}`;

									trackEvent(TopicCenterAnalyticsEvent.clickPinboardNote(eventLabel));

									mixpanel.track('Topic Center Pinboard Item Click', {
										'Topic Center ID': topicCenter.topicCenterId,
										'Topic Center Title': topicCenter.name,
										'Section Title': topicCenterRow.title,
										'Pinboard Item ID': pinboardNote.pinboardNoteId,
										'Pinboard Item Title': pinboardNote.title,
									});

									onClick?.(pinboardNote.url);
								}}
							>
								{pinboardNote.title}
							</a>
						) : (
							pinboardNote.title
						)}
					</h5>
				</div>

				<p onClick={handleDangerousHtmlClick} dangerouslySetInnerHTML={{ __html: pinboardNote.description }} />
			</div>
		</div>
	);
};
