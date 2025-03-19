import React, { useCallback, useEffect, useState } from 'react';
import { screeningService } from '@/lib/services';
import { ScreeningQuestionContext } from '@/components/screening-v2';
import AsyncWrapper from '../async-page';

interface ScreeningProps {
	screeningFlowId: string;
}

export const ScreeningFlow = ({ screeningFlowId }: ScreeningProps) => {
	const [initialScreeningQuestionContextId, setInitialScreeningQuestionContextId] = useState('');

	const fetchData = useCallback(async () => {
		const { screeningSession } = await screeningService.createScreeningSession({ screeningFlowId }).fetch();
		const { nextScreeningQuestionContextId } = screeningSession;

		if (!nextScreeningQuestionContextId) {
			window.alert('screening complete, redirect or something.');
			return;
		}

		setInitialScreeningQuestionContextId(nextScreeningQuestionContextId);
	}, [screeningFlowId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			{initialScreeningQuestionContextId && (
				<ScreeningQuestionContext initialScreeningQuestionContextId={initialScreeningQuestionContextId} />
			)}
		</AsyncWrapper>
	);
};
