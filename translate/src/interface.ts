interface SentenceItem {
	backend: number;
	orig: string;
	trans: string;
}

interface DictItem {
	pos: string;
	terms: string[];
}

export interface Responce {
	dict: DictItem[];
	sentences: SentenceItem[];
	src: string;
}

export interface Cached {
	[propName: string]: string;
}
