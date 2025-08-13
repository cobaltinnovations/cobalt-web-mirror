import React from 'react';
import { ScreeningImageId } from '@/lib/models';
import { ReactComponent as Appointment } from '@/assets/screening-images/appointment.svg';
import { ReactComponent as BBSurveyIntro } from '@/assets/screening-images/BB_SurveyIntroImage.svg';
import { ReactComponent as ConnectedToCare } from '@/assets/screening-images/connected-to-care.svg';
import { ReactComponent as ConnectingToCare } from '@/assets/screening-images/connecting-to-care.svg';
import { ReactComponent as FeelingRecently } from '@/assets/screening-images/feeling-recently.svg';
import { ReactComponent as Goals } from '@/assets/screening-images/goals.svg';
import { ReactComponent as KeepGoing } from '@/assets/screening-images/keep-going.svg';
import { ReactComponent as NextAppointmentScheduled } from '@/assets/screening-images/next-appointment-scheduled.svg';
import { ReactComponent as Resources } from '@/assets/screening-images/resources.svg';
import { ReactComponent as Safety } from '@/assets/screening-images/safety.svg';
import { ReactComponent as ScreeningComplete } from '@/assets/screening-images/screening-complete.svg';
import { ReactComponent as ScreeningToDo } from '@/assets/screening-images/screening-to-do.svg';
import { ReactComponent as Welcome } from '@/assets/screening-images/welcome.svg';

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
