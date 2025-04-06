export type UserTune = {
	id: string;
	rememberName: boolean;
	rememberMelody: boolean;
	playCount: number;
	note: string;
	playHistory: {
		[key: string]: number;
	};
};
