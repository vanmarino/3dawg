import { AudioGraphNode } from "./AudioGraph";
export * from "./AudioGraph";

export enum AudioGraphNodes {
    Oscillator = "Oscillator",
    Gain = "Gain",
    Output = "Output"
}

export interface AudioGraphLink {
    id: string;
    from: AudioGraphNode;
    to: AudioGraphNode;
    muted: boolean;
};

export interface Keyframe {
    position: number,
    parameters: AudioParam
}

export interface Bar {
    id: string;
    keyframes: Keyframe[];
    duration: number;
}

export interface Arranged {
    start: number;
    track: number;
}

export interface ArrangedBar extends Bar, Arranged {}

export type GetActiveSections = (position: number) => Record<number, ArrangedSection[]>

export interface Composition extends Bar {
    sections: ArrangedSection[];
    getActiveSections: GetActiveSections;
}

export interface ArrangedComposition extends Composition, Arranged {}

export type ArrangedSection = ArrangedBar | ArrangedComposition

export enum TimelineState {
    Stopped = -1,
    Paused,
    Playing,
    Scrubbing
}

export interface Timeline extends Composition {
    position: number;
    state: TimelineState;
}