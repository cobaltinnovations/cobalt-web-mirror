import React, { FC, createContext, useState, useRef, useCallback, PropsWithChildren } from 'react';

export type AlertVariant = '' | 'success' | 'warning' | 'danger';

interface AlertConfig {
	text: string;
	variant: AlertVariant;
}

interface AlertContextConfig {
	alertText: string;
	alertVariant: AlertVariant;
	alertIsShowing: boolean;
	showAlert(alertConfig: AlertConfig): void;
	hideAlert(): void;
}

const AlertContext = createContext({} as AlertContextConfig);

const AlertProvider: FC<PropsWithChildren> = (props) => {
	const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const [alertText, setAlertText] = useState('');
	const [alertVariant, setAlertVariant] = useState<AlertVariant>('');
	const [alertIsShowing, setAlertIsShowing] = useState(false);

	const hideAlert = useCallback(() => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
		}

		setAlertIsShowing(false);
	}, []);

	const showAlert = useCallback(
		(alertConfig: AlertConfig) => {
			setAlertText(alertConfig.text);
			setAlertVariant(alertConfig.variant);
			setAlertIsShowing(true);

			hideTimeoutRef.current = setTimeout(() => {
				hideAlert();
			}, 3000);
		},
		[hideAlert]
	);

	const value = {
		alertText,
		alertVariant,
		alertIsShowing,
		showAlert,
		hideAlert,
	};

	return <AlertContext.Provider value={value}>{props.children}</AlertContext.Provider>;
};

const AlertConsumer = AlertContext.Consumer;

export { AlertContext, AlertProvider, AlertConsumer };
