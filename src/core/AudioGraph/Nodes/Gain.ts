import { TContext, IGainOptions, GainNode } from "standardized-audio-context";
import { AudioGraphNode } from "./Node";
import { AudioGraphNodes } from "../types";

const defaults = {
  gain: 0.5,
};

export class AudioGraphNodeGain extends AudioGraphNode<
  GainNode<TContext>,
  IGainOptions
> {
  public readonly type: AudioGraphNodes = AudioGraphNodes.Gain;
  reconstruct = () => (this.node = new GainNode(this.audioContext, this.parameters));

  constructor() {
    super();
    this._parametersDefault = defaults;
    this._parameters = {...defaults};
  }
}