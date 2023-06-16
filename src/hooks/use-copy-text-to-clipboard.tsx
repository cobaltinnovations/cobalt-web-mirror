import { useCallback } from 'react';
import { copyTextToClipboard as cttc } from '@/lib/utils';
import useFlags from '@/hooks/use-flags';

export const useCopyTextToClipboard = () => {
	const { addFlag } = useFlags();

	const copyTextToClipboard = useCallback(
		(
			text: string,
			messageConfig: {
				successTitle: string;
				errorTitle: string;
				successDescription?: string;
				errorDesctiption?: string;
			}
		) => {
			cttc(
				text,
				() => {
					addFlag({
						variant: 'success',
						title: messageConfig.successTitle,
						description: messageConfig.successDescription,
						actions: [],
					});
				},
				() => {
					addFlag({
						variant: 'success',
						title: messageConfig.errorTitle,
						description: messageConfig.errorDesctiption,
						actions: [],
					});
				}
			);
		},
		[addFlag]
	);

	return copyTextToClipboard;
};
