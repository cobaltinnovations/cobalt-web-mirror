import { useCallback, useContext } from 'react';

import { ErrorConfig } from '@/lib/http-client';
import { ErrorModalContext } from '@/contexts/error-modal-context';

function useHandleError() {
	const { setShow, setError } = useContext(ErrorModalContext);

	const handleError = useCallback(
		(error?: ErrorConfig) => {
			setShow(true);
			setError(error);
		},
		[setShow, setError]
	);

	return handleError;
}

export default useHandleError;
