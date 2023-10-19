import { TopicCenterDisplayStyleId, TopicCenterModel } from '@/lib/models';
import { topicCenterService } from '@/lib/services';
import { useCallback, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import useAnalytics from './use-analytics';
import { TopicCenterAnalyticsEvent } from '@/contexts/analytics-context';

export function useTopicCenterState(topicCenterId?: string) {
	const navigate = useNavigate();
	const [topicCenter, setTopicCenter] = useState<TopicCenterModel>();
	const { mixpanel, trackEvent } = useAnalytics();
	const featuredTopicsRouteMatch = useMatch({
		path: '/featured-topics/*',
	});

	const isFeaturedMatch = !!featuredTopicsRouteMatch;

	const fetchData = useCallback(async () => {
		if (!topicCenterId) {
			throw new Error('topicCenterId is undefined.');
		}

		const response = await topicCenterService.getTopicCenterById(topicCenterId).fetch();

		if (isFeaturedMatch && response.topicCenter.topicCenterDisplayStyleId !== TopicCenterDisplayStyleId.FEATURED) {
			navigate(`/topic-centers/${response.topicCenter.urlName}`, { replace: true });
		} else if (
			!isFeaturedMatch &&
			response.topicCenter.topicCenterDisplayStyleId === TopicCenterDisplayStyleId.FEATURED
		) {
			navigate(`/featured-topics/${response.topicCenter.urlName}`, { replace: true });
		}

		setTopicCenter(response.topicCenter);
		mixpanel.track('Topic Center Page View', {
			'Topic Center ID': response.topicCenter.topicCenterId,
			'Topic Center Title': response.topicCenter.name,
		});
	}, [isFeaturedMatch, mixpanel, navigate, topicCenterId]);

	const trackContentEvent = useCallback(
		(
			topicCenterRow?: TopicCenterModel['topicCenterRows'][number],
			content?: TopicCenterModel['topicCenterRows'][number]['contents'][number]
		) => {
			const contentUrl = `/resource-library/${content?.contentId}`;
			const eventLabel = `topicCenterTitle:${topicCenter?.name}, sectionTitle:${topicCenterRow?.title}, cardTitle:${content?.title}, url:${contentUrl}`;
			trackEvent(TopicCenterAnalyticsEvent.clickOnYourTimeContent(eventLabel));

			mixpanel.track('Topic Center Content Click', {
				'Topic Center ID': topicCenter?.topicCenterId,
				'Topic Center Title': topicCenter?.name,
				'Section Title': topicCenterRow?.title,
				'Content ID': content?.contentId,
				'Content Title': content?.title,
			});
		},
		[mixpanel, topicCenter?.name, topicCenter?.topicCenterId, trackEvent]
	);

	return {
		fetchData,
		topicCenter,
		trackContentEvent,
	};
}
