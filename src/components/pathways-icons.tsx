import React from 'react';

import { FeatureId } from '@/lib/models';
import SvgIcon from '@/components/svg-icon';

const PathwaysIcon = ({
	featureId,
	svgProps,
	className,
}: {
	featureId: FeatureId;
	svgProps?: React.SVGProps<SVGSVGElement> & {
		title?: string | undefined;
	};
	className?: string;
}) => {
	const iconMap: Record<FeatureId, JSX.Element> = {
		[FeatureId.COUNSELING_SERVICES]: (
			<SvgIcon kit="fak" icon="handshake-simple" className={className} {...svgProps} />
		),
		[FeatureId.THERAPY]: <SvgIcon kit="fas" icon="comment-dots" className={className} {...svgProps} />,
		[FeatureId.MEDICATION_PRESCRIBER]: <SvgIcon kit="fak" icon="pill" className={className} {...svgProps} />,
		[FeatureId.GROUP_SESSIONS]: (
			<SvgIcon kit="fak" icon="people-group-support" className={className} {...svgProps} />
		),
		[FeatureId.COACHING]: <SvgIcon kit="fak" icon="handshake-simple" className={className} {...svgProps} />,
		[FeatureId.SPIRITUAL_SUPPORT]: (
			<SvgIcon kit="fas" icon="hands-holding-heart" className={className} {...svgProps} />
		),
		[FeatureId.CRISIS_SUPPORT]: <SvgIcon kit="fas" icon="star-of-life" className={className} {...svgProps} />,
		[FeatureId.SELF_HELP_RESOURCES]: <SvgIcon kit="fak" icon="menu-book" className={className} {...svgProps} />,

		[FeatureId.COURSE]: <SvgIcon kit="far" icon="chalkboard" className={className} {...svgProps} />,
		[FeatureId.INSTITUTION_RESOURCES]: <SvgIcon kit="fas" icon="hospital" className={className} {...svgProps} />,
		[FeatureId.MENTAL_HEALTH_PROVIDERS]: (
			<SvgIcon kit="fas" icon="handshake-simple" className={className} {...svgProps} />
		),
		[FeatureId.MHP]: <SvgIcon kit="fas" icon="gear" className={className} {...svgProps} />,
		[FeatureId.MSW]: <SvgIcon kit="fas" icon="gear" className={className} {...svgProps} />,
		[FeatureId.MY_EVENTS]: <SvgIcon kit="fas" icon="calendar-day" className={className} {...svgProps} />,
		[FeatureId.PSYCHIATRIST]: <SvgIcon kit="fas" icon="gear" className={className} {...svgProps} />,
		[FeatureId.PSYCHOLOGIST]: <SvgIcon kit="fas" icon="gear" className={className} {...svgProps} />,
		[FeatureId.PSYCHOTHERAPIST]: <SvgIcon kit="fas" icon="gear" className={className} {...svgProps} />,
		[FeatureId.RESOURCE_NAVIGATOR]: <SvgIcon kit="fas" icon="compass" className={className} {...svgProps} />,
	};

	return iconMap[featureId];
};

export default PathwaysIcon;
