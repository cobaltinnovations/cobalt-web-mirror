import React, { useCallback, useState } from 'react';
import { ScreeningFlowParams, screeningService } from '@/lib/services';
import { ScreeningQuestionContext } from '@/components/screening-v2';
import AsyncWrapper from '@/components/async-page';
import { ScreeningSessionDestination } from '@/lib/models';
import { useScreeningV2Styles } from './use-screening-v2-styles';

interface ScreeningProps {
	screeningFlowParams: ScreeningFlowParams;
	onScreeningFlowComplete(screeningSessionDestination?: ScreeningSessionDestination): void;
}

export const ScreeningFlow = ({ screeningFlowParams, onScreeningFlowComplete }: ScreeningProps) => {
	useScreeningV2Styles();
	const [initialScreeningQuestionContextId, setInitialScreeningQuestionContextId] = useState('');

	const fetchData = useCallback(async () => {
		const { screeningSession } = await screeningService.createScreeningSession(screeningFlowParams).fetch();
		const { nextScreeningQuestionContextId } = screeningSession;

		if (!nextScreeningQuestionContextId) {
			onScreeningFlowComplete(screeningSession.screeningSessionDestination);
			return;
		}

		setInitialScreeningQuestionContextId(nextScreeningQuestionContextId);
	}, [onScreeningFlowComplete, screeningFlowParams]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			{initialScreeningQuestionContextId && (
				<ScreeningQuestionContext
					initialScreeningQuestionContextId={initialScreeningQuestionContextId}
					onScreeningFlowComplete={onScreeningFlowComplete}
				/>
			)}
		</AsyncWrapper>
	);
};
