import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import React, { FC, createContext, useState, useCallback, PropsWithChildren, createRef } from 'react';

interface FlagModel {
	flagId: string;
	variant: 'primary' | 'success' | 'warning' | 'danger';
	title: string;
	description?: string;
	actions: FlagAction[];
	nodeRef: React.RefObject<HTMLDivElement>;
}

type AddFlagConfig = Omit<FlagModel, 'flagId' | 'nodeRef'>;

interface FlagAction {
	title: string;
	onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

type ErrorModalContextConfig = {
	flags: FlagModel[];
	addFlag(flag: AddFlagConfig): void;
	removeFlagByFlagId(flagId: string): void;
};

const FlagsContext = createContext({} as ErrorModalContextConfig);

const FlagsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [flags, setFlags] = useState<FlagModel[]>([]);

	const addFlag = useCallback(
		(flag: AddFlagConfig) => {
			const flagId = uuidv4();
			const nodeRef = createRef<HTMLDivElement>();
			const flagsClone = cloneDeep(flags);

			flagsClone.unshift({ flagId, nodeRef, ...flag });
			setFlags(flagsClone);
		},
		[flags]
	);

	const removeFlagByFlagId = useCallback(
		(flagId: string) => {
			const flagsClone = cloneDeep(flags);
			const indexToRemove = flagsClone.findIndex((f) => f.flagId === flagId);

			if (indexToRemove > -1) {
				flagsClone.splice(indexToRemove, 1);
			}

			setFlags(flagsClone);
		},
		[flags]
	);

	const value = {
		flags,
		addFlag,
		removeFlagByFlagId,
	};

	return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
};

export { FlagsContext, FlagsProvider };
