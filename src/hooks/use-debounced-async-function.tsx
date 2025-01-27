import { debounce } from 'lodash';
import { useRef } from 'react';

function useDebouncedAsyncFunction(
	asyncFunction: (...args: any[]) => Promise<void>,
	wait = 1500
): (...args: any[]) => void {
	const debouncedFunction = useRef(
		debounce(async (...args: any[]) => {
			try {
				await asyncFunction(...args);
			} catch (error) {
				throw error;
			}
		}, wait)
	);

	return debouncedFunction.current;
}

export default useDebouncedAsyncFunction;
