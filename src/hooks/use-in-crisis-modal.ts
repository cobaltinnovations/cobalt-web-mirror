import { useContext, useCallback } from 'react';
import { InCrisisModalContext } from '@/contexts/in-crisis-modal-context';

const useInCrisisModal = () => {
	const { show, setShow, isCall, setIsCall } = useContext(InCrisisModalContext);

	const openInCrisisModal = useCallback(
		(isCall = false) => {
			setShow(true);
			setIsCall(isCall);
		},
		[setIsCall, setShow]
	);

	const closeInCrisisModal = useCallback(() => {
		setShow(false);
		setIsCall(false);
	}, [setIsCall, setShow]);

	return { show, isCall, openInCrisisModal, closeInCrisisModal };
};

export default useInCrisisModal;
