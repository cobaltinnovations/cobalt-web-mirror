import React from 'react';
import { ScreeningImageId } from '@/lib/models';
import Appointment from '@/assets/screening-images/appointment.svg?react';
import BBSurveyIntro from '@/assets/screening-images/BB_SurveyIntroImage.svg?react';
import BBSleep from '@/assets/screening-images/BB_CourseCover_Sleep.svg?react';
import ConnectedToCare from '@/assets/screening-images/connected-to-care.svg?react';
import ConnectingToCare from '@/assets/screening-images/connecting-to-care.svg?react';
import FeelingRecently from '@/assets/screening-images/feeling-recently.svg?react';
import Goals from '@/assets/screening-images/goals.svg?react';
import KeepGoing from '@/assets/screening-images/keep-going.svg?react';
import NextAppointmentScheduled from '@/assets/screening-images/next-appointment-scheduled.svg?react';
import Resources from '@/assets/screening-images/resources.svg?react';
import Safety from '@/assets/screening-images/safety.svg?react';
import ScreeningComplete from '@/assets/screening-images/screening-complete.svg?react';
import ScreeningToDo from '@/assets/screening-images/screening-to-do.svg?react';
import Welcome from '@/assets/screening-images/welcome.svg?react';

const idImageMap: Record<
	ScreeningImageId,
	React.FunctionComponent<
		React.SVGProps<SVGSVGElement> & {
			title?: string;
		}
	>
> = {
	[ScreeningImageId.Appointment]: Appointment,
	[ScreeningImageId.ConnectedToCare]: ConnectedToCare,
	[ScreeningImageId.ConnectingToCare]: ConnectingToCare,
	[ScreeningImageId.FeelingRecently]: FeelingRecently,
	[ScreeningImageId.Goals]: Goals,
	[ScreeningImageId.KeepGoing]: KeepGoing,
	[ScreeningImageId.NextAppointmentScheduled]: NextAppointmentScheduled,
	[ScreeningImageId.PeoplePuzzle]: BBSurveyIntro,
	[ScreeningImageId.Resources]: Resources,
	[ScreeningImageId.Safety]: Safety,
	[ScreeningImageId.ScreeningComplete]: ScreeningComplete,
	[ScreeningImageId.ScreeningToDo]: ScreeningToDo,
	[ScreeningImageId.Welcome]: Welcome,
	[ScreeningImageId.Sleep]: BBSleep,
};

interface ScreeningPromptImageProps extends React.SVGProps<SVGSVGElement> {
	screeningImageId: ScreeningImageId;
}

const ScreeningPromptImage = ({ screeningImageId, ...svgProps }: ScreeningPromptImageProps) => {
	const SvgElement = idImageMap[screeningImageId];

	if (!SvgElement) {
		return null;
	}

	return <SvgElement {...svgProps} />;
};

export default ScreeningPromptImage;
