import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AudioGraph, AudioGraphNode } from "../core/AudioGraph/Nodes";
import { AudioGraphLink, IAudioGraphNode } from "../core/AudioGraph/interfaces";
import { Composer } from "../core/Composer/Composer";
import { AudioGraphNodeDestination } from "../core/AudioGraph/Nodes/Destination";
import { AudioGraphNodes } from "../core/AudioGraph/types";
import { link } from "fs";

type ComposerProviderType = {
  onLinks?: typeof AudioGraph.prototype.onLinks;
  onNodes?: typeof AudioGraph.prototype.onNodes;
  onPlayback?: typeof AudioGraph.prototype.onPlayback;
  activeGraph?: AudioGraph;
  setActiveGraph: (id: string) => void;
  composer: Composer;
  start: () => void;
  stop: () => void;
};

type ComposerConsumerType = {
  composer: Composer;
  links: AudioGraphLink[];
  nodes: AudioGraphNode[];
  playing: boolean;
  activeGraph?: AudioGraph;
  graphs: AudioGraph[];
  setActiveGraph: (id: string) => void;
  start: () => void;
  stop: () => void;
};

type ComposerProviderProps = {
  children: ReactNode;
};

const ComposerContext = createContext<ComposerProviderType | undefined>(
  undefined
);

const ComposerProviderInternal: React.FC<ComposerProviderProps> = ({
  children,
}) => {
  const composer = useRef(new Composer());
  const [activeGraph, setActiveGraph] = useState<AudioGraph>();
  const destinationNode = useRef<AudioGraphNodeDestination>(
    new AudioGraphNodeDestination()
  );

  const linkDestination = useCallback(
    (graph: AudioGraph) => {
      graph.addAudioNode(destinationNode.current);
      graph.nodes.forEach((node) => {
        if (node.type === AudioGraphNodes.Output) {
          graph.linkNodes(node.id, destinationNode.current.id);
        }
      });
    },
    [activeGraph]
  );

  const unlinkDestination = useCallback(
    (graph: AudioGraph) => {
      graph.nodes.forEach((node) => {
        if (node.type === AudioGraphNodes.Output) {
          graph.unlinkNodes(node.id, destinationNode.current.id);
          graph.removeAudioNode(destinationNode.current.id);
        }
      });
    },
    [activeGraph]
  );

  const start = useCallback(() => {
    const lastActiveGraph = activeGraph;

    if (lastActiveGraph) {
      linkDestination(lastActiveGraph);

      lastActiveGraph.start();
    }
  }, [activeGraph]);

  const stop = useCallback(() => {
    const lastActiveGraph = activeGraph;

    if (lastActiveGraph) {
      lastActiveGraph.stop();

      unlinkDestination(lastActiveGraph);
    }
  }, [activeGraph]);

  const setActiveGraphById = useCallback(
    (id: string) => {
      const graph = composer.current.findGraph(id);

      if (graph) {
        if (activeGraph) stop();

        setActiveGraph(graph);
      } else {
        throw new Error(`Graph with id ${id} not found`);
      }
    },
    [composer]
  );

  useEffect(() => {
    const lastActiveGraph = activeGraph;

    if (lastActiveGraph) {
      return () => {
        if (lastActiveGraph.isPlaying)
          lastActiveGraph.stop();
        
        unlinkDestination(lastActiveGraph)
      };
    }
  }, [activeGraph]);

  return (
    <ComposerContext.Provider
      value={{
        composer: composer.current,
        onLinks: activeGraph?.onLinks,
        onNodes: activeGraph?.onNodes,
        onPlayback: activeGraph?.onPlayback,
        setActiveGraph: setActiveGraphById,
        activeGraph: activeGraph,
        start,
        stop,
      }}
    >
      {children}
    </ComposerContext.Provider>
  );
};

const ComposerProvider: React.FC<ComposerProviderProps> = ({ children }) => {
  return <ComposerProviderInternal>{children}</ComposerProviderInternal>;
};
const useComposer = (): ComposerConsumerType => {
  const context = useContext(ComposerContext);
  const [links, setLinks] = useState<AudioGraphLink[]>([]);
  const [nodes, setNodes] = useState<AudioGraphNode[]>([]);
  const [playing, setPlaying] = useState(false);

  if (!context) {
    throw new Error("useComposer must be used within a ComposerProvider");
  }

  useEffect(() => {
    if (context.onLinks) {
      const cb = (links: AudioGraphLink[]) => setLinks([...links]);
      context.onLinks.subscribe(cb);
      return () => context.onLinks?.unsubscribe(cb);
    } else {
      setLinks([]);
    }
  }, [context.onLinks]);

  useEffect(() => {
    if (context.onNodes) {
      const cb = (nodes: IAudioGraphNode[]) =>
        setNodes([...nodes] as AudioGraphNode[]);
      context.onNodes.subscribe(cb);
      return () => context.onNodes?.unsubscribe(cb);
    } else {
      setNodes([]);
    }
  }, [context.onNodes]);

  useEffect(() => {
    if (context.onPlayback) {
      const cb = setPlaying;
      context.onPlayback.subscribe(cb);
      return () => context.onPlayback?.unsubscribe(cb);
    } else {
      setPlaying(false);
    }
  }, [context.onPlayback]);

  return {
    composer: context.composer,
    activeGraph: context.activeGraph,
    graphs: context.composer.graphs,
    links,
    nodes,
    playing,
    setActiveGraph: context.setActiveGraph,
    start: context.start,
    stop: context.stop,
  };
};
export { ComposerContext, ComposerProvider, useComposer };
