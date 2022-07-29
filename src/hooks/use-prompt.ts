import { useCallback, useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

// https://denislistiadi.medium.com/react-router-v6-preventing-transitions-2389806e8556

export function useBlocker(blocker: (...arg: any[]) => void, when = true) {
	const { navigator } = useContext(NavigationContext);

	useEffect(() => {
		if (!when) {
			return;
		}

		//@ts-expect-error
		const unblock = navigator.block((tx) => {
			const autoUnblockingTx = {
				...tx,
				retry() {
					unblock();
					tx.retry();
				},
			};
			blocker(autoUnblockingTx);
		});

		return unblock;
	}, [navigator, blocker, when]);
}

export default function usePrompt(message: string, when = true) {
	const blocker = useCallback(
		(routerAction: any) => {
			if (window.confirm(message)) {
				routerAction.retry();
			}
		},
		[message]
	);
	useBlocker(blocker, when);
}
