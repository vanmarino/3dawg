import { Subscribable } from "../../utils/Subscribable";
import { AudioGraph, IAudioGraph } from "../AudioGraph";

export class Composer {
    private _graphs: IAudioGraph[] = [];
    public readonly onGraphsChange = new Subscribable<IAudioGraph[]>(() => this._graphs);
    public get graphs() {
        return this._graphs;
    }

    createNewGraph(): IAudioGraph {
        const newAudioGraph = new AudioGraph();
        this._graphs.push(newAudioGraph);
        this.onGraphsChange.notify();
        return newAudioGraph;
    }

    addGraph(graph: IAudioGraph) {
        const i = this._graphs.findIndex((g) => g.id === graph.id);
        if (i >= 0) {
            console.warn(`Graph with id ${graph.id} already exists in the composer`);
        } else {
            this._graphs.push(graph);
            this.onGraphsChange.notify();
        }
    }

    removeGraph(id: string) {
        const index = this._graphs.findIndex((graph) => graph.id === id);
        if (index >= 0) {
            this._graphs.splice(index, 1);
            this.onGraphsChange.notify();
            return true;
        }
        return false;
    }
    
    findGraph(id: string): IAudioGraph | undefined {
        return this._graphs.find((graph) => graph.id === id);
    }
}