import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ScreeningSession } from '@/lib/models';
import { screeningService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import RenderJson from '@/components/render-json';

interface ScreeningProps {
	screeningFlowId: string;
}

export const ScreeningFlow = ({ screeningFlowId }: ScreeningProps) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [screeningFlowResponse, setScreeningFlowResponse] = useState<ScreeningSession>();

	const fetchData = useCallback(async () => {
		setIsLoading(true);

		try {
			const { activeScreeningFlowVersionId } = await screeningService
				.getScreeningFlowVersionsByFlowId({
					screeningFlowId,
				})
				.fetch();
			const { screeningSession } = await screeningService
				.createScreeningSession({
					screeningFlowVersionId: activeScreeningFlowVersionId,
				})
				.fetch();

			setScreeningFlowResponse(screeningSession);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, screeningFlowId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div>
			<Form>
				<fieldset disabled={isLoading}>
					<RenderJson json={screeningFlowResponse} />
				</fieldset>
			</Form>
		</div>
	);
};
