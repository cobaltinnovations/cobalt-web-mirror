import React from 'react';

import { ReactComponent as TherapyIcon } from '@/assets/icons/icon-therapy.svg';
import { ReactComponent as MedicationIcon } from '@/assets/icons/icon-medication.svg';
import { ReactComponent as CoachingIcon } from '@/assets/icons/icon-coaching.svg';
import { ReactComponent as SpiritualIcon } from '@/assets/icons/icon-spiritual.svg';
import { ReactComponent as CrisisIcon } from '@/assets/icons/icon-crisis.svg';
import { ReactComponent as GroupIcon } from '@/assets/icons/icon-group.svg';
import { ReactComponent as ResourceIcon } from '@/assets/icons/icon-resource.svg';
import { ReactComponent as InstitutionResourcesIcon } from '@/assets/icons/icon-institution-resources.svg';
import { ReactComponent as AdminIcon } from '@/assets/icons/icon-admin.svg';
import { FeatureId } from '@/lib/models';

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
	switch (featureId) {
		case FeatureId.THERAPY:
			return <TherapyIcon className={className} {...svgProps} />;
		case FeatureId.MEDICATION_PRESCRIBER:
			return <MedicationIcon className={className} {...svgProps} />;
		case FeatureId.GROUP_SESSIONS:
			return <GroupIcon className={className} {...svgProps} />;
		case FeatureId.COACHING:
			return <CoachingIcon className={className} {...svgProps} />;
		case FeatureId.SELF_HELP_RESOURCES:
			return <ResourceIcon className={className} {...svgProps} />;
		case FeatureId.INSTITUTION_RESOURCES:
			return <InstitutionResourcesIcon className={className} {...svgProps} />;
		case FeatureId.SPIRITUAL_SUPPORT:
			return <SpiritualIcon className={className} {...svgProps} />;
		case FeatureId.CRISIS_SUPPORT:
			return <CrisisIcon className={className} {...svgProps} />;
		default:
			return <AdminIcon className={className} {...svgProps} />;
	}
};

export default PathwaysIcon;
