import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import React, {
	FC,
	createContext,
	useState,
	useCallback,
	PropsWithChildren,
	createRef,
	useRef,
	useEffect,
} from 'react';

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

type FlagsContextConfig = {
	flags: FlagModel[];
	addFlag(flag: AddFlagConfig): void;
	removeFlagByFlagId(flagId: string): void;
	removalDurationInMs: number;
};

const FlagsContext = createContext({} as FlagsContextConfig);

const FlagsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [flags, setFlags] = useState<FlagModel[]>([]);
	const removalTimeout = useRef<NodeJS.Timeout>();
	const removalDurationInMs = useRef(8000);

	const addFlag = useCallback((flag: AddFlagConfig) => {
		const flagId = uuidv4();
		const nodeRef = createRef<HTMLDivElement>();

		setFlags((previousValue) => {
			return [
				{
					flagId,
					nodeRef,
					...flag,
				},
				...previousValue,
			];
		});
	}, []);

	const removeFlagByFlagId = useCallback((flagId: string) => {
		setFlags((previousValue) => {
			const flagsClone = cloneDeep(previousValue);
			const indexToRemove = flagsClone.findIndex((f) => f.flagId === flagId);

			if (indexToRemove > -1) {
				flagsClone.splice(indexToRemove, 1);
			}

			return flagsClone;
		});
	}, []);

	const startRemovalTimeout = useCallback(() => {
		if (removalTimeout.current) {
			clearTimeout(removalTimeout.current);
		}

		removalTimeout.current = setTimeout(() => {
			setFlags((previousValue) => {
				const flagsClone = cloneDeep(previousValue);
				flagsClone.shift();
				return flagsClone;
			});
		}, removalDurationInMs.current);
	}, []);

	useEffect(() => {
		if (flags.length > 0) {
			startRemovalTimeout();
		}
	}, [flags.length, startRemovalTimeout]);

	const value = {
		flags,
		addFlag,
		removeFlagByFlagId,
		removalDurationInMs: removalDurationInMs.current,
	};

	return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
};

export { FlagsContext, FlagsProvider };
