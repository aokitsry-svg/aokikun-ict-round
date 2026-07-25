import {Composition} from "remotion";
import {StarterVideo} from "./StarterVideo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="StarterHorizontal"
        component={StarterVideo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{format: "horizontal" as const}}
      />
      <Composition
        id="StarterVertical"
        component={StarterVideo}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{format: "vertical" as const}}
      />
    </>
  );
};
