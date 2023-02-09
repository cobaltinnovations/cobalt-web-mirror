import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import React, { FC, createContext, useState, useCallback, PropsWithChildren, useEffect } from 'react';

interface FlagConfig {
	flagId: string;
	title: string;
	description: string;
	actions: FlagAction[];
}

interface FlagAction {
	title: string;
	onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

type ErrorModalContextConfig = {
	addFlag(flag: Omit<FlagConfig, 'flagId'>): void;
};

const FlagsContext = createContext({} as ErrorModalContextConfig);

const FlagsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [flags, setFlags] = useState<FlagConfig[]>([]);

	const addFlag = useCallback(
		(flag: Omit<FlagConfig, 'flagId'>) => {
			const flagId = uuidv4();

			const flagsClone = cloneDeep(flags);
			flagsClone.push({ flagId, ...flag });

			setFlags(flagsClone);
		},
		[flags]
	);

	useEffect(() => {
		console.log(flags);
	}, [flags]);

	const value = {
		addFlag,
	};

	return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
};

export { FlagsContext, FlagsProvider };
