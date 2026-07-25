import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type StarterVideoProps = {
  format: "horizontal" | "vertical";
};

const points = [
  "参考動画の構成とテンポを分析",
  "表現ルールをスタイルプロファイル化",
  "横型・縦型のMP4を自動生成",
];

export const StarterVideo = ({format}: StarterVideoProps) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const vertical = format === "vertical";

  const titleProgress = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 120},
  });
  const titleY = interpolate(titleProgress, [0, 1], [70, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const closingOpacity = interpolate(
    frame,
    [130, 155, 179],
    [0, 1, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  const contentWidth = vertical ? width - 120 : Math.min(1500, width - 180);
  const titleSize = vertical ? 78 : 92;
  const pointSize = vertical ? 36 : 34;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 15% 10%, #e9f7f4 0%, #f7fbfa 38%, #ffffff 75%)",
        color: "#153b36",
        fontFamily:
          '"Noto Sans CJK JP", "Noto Sans JP", Inter, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
        padding: vertical ? "130px 60px" : "100px 90px",
      }}
    >
      <div
        style={{
          width: contentWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          gap: vertical ? 70 : 48,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              borderRadius: 999,
              backgroundColor: "#d9f1ec",
              padding: vertical ? "16px 28px" : "12px 24px",
              fontSize: vertical ? 28 : 24,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: vertical ? 36 : 26,
            }}
          >
            CODEX × REMOTION
          </div>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.22,
              letterSpacing: "-0.035em",
              maxWidth: vertical ? 880 : 1400,
            }}
          >
            動画制作を、指示と確認だけの仕事へ。
          </div>
          <div
            style={{
              marginTop: vertical ? 34 : 24,
              fontSize: vertical ? 34 : 30,
              lineHeight: 1.55,
              color: "#52736e",
              fontWeight: 500,
            }}
          >
            YouTubeの参考URLから表現を研究し、再利用できる動画の型に変換します。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: vertical ? "column" : "row",
            gap: vertical ? 26 : 24,
          }}
        >
          {points.map((point, index) => {
            const itemProgress = spring({
              frame: frame - 35 - index * 13,
              fps,
              config: {damping: 20, stiffness: 115},
            });
            const itemY = interpolate(itemProgress, [0, 1], [45, 0]);
            const itemOpacity = interpolate(itemProgress, [0, 1], [0, 1]);

            return (
              <div
                key={point}
                style={{
                  flex: 1,
                  minHeight: vertical ? 190 : 210,
                  borderRadius: vertical ? 34 : 30,
                  backgroundColor: "rgba(255,255,255,0.88)",
                  border: "2px solid rgba(99, 166, 154, 0.22)",
                  boxShadow: "0 24px 70px rgba(30, 77, 70, 0.09)",
                  padding: vertical ? "38px 42px" : "38px 34px",
                  display: "flex",
                  alignItems: "center",
                  gap: vertical ? 30 : 22,
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                }}
              >
                <div
                  style={{
                    flex: "0 0 auto",
                    width: vertical ? 70 : 62,
                    height: vertical ? 70 : 62,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2f786d",
                    color: "white",
                    fontWeight: 800,
                    fontSize: vertical ? 32 : 28,
                  }}
                >
                  {index + 1}
                </div>
                <div
                  style={{
                    fontSize: pointSize,
                    lineHeight: 1.45,
                    fontWeight: 700,
                  }}
                >
                  {point}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: closingOpacity,
            fontSize: vertical ? 31 : 27,
            color: "#6b8581",
            textAlign: "right",
            fontWeight: 600,
          }}
        >
          Aoki Video Factory / starter composition
        </div>
      </div>
    </AbsoluteFill>
  );
};
