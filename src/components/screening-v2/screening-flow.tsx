import React, { useCallback, useState } from 'react';
import { screeningService } from '@/lib/services';
import { ScreeningQuestionContext } from '@/components/screening-v2';
import AsyncWrapper from '../async-page';

interface ScreeningProps {
	screeningFlowId: string;
	onScreeningFlowComplete(): void;
}

export const ScreeningFlow = ({ screeningFlowId, onScreeningFlowComplete }: ScreeningProps) => {
	const [initialScreeningQuestionContextId, setInitialScreeningQuestionContextId] = useState('');

	const fetchData = useCallback(async () => {
		const { screeningSession } = await screeningService.createScreeningSession({ screeningFlowId }).fetch();
		const { nextScreeningQuestionContextId } = screeningSession;

		if (!nextScreeningQuestionContextId) {
			onScreeningFlowComplete();
			return;
		}

		setInitialScreeningQuestionContextId(nextScreeningQuestionContextId);
	}, [onScreeningFlowComplete, screeningFlowId]);

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
