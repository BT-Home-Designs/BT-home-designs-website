import Image from "next/image";
import type { MediaSlot } from "@/lib/data/media";

type Scene = "living-room" | "dining-room";

/**
 * Fills its container edge-to-edge like a real photo would. If `media.src`
 * is set, renders that file with next/image. Otherwise renders an
 * original line-art interior illustration (not a stock photo — we don't
 * have licensing rights to redistribute one, and a labeled gray box reads
 * as broken/unfinished) in the site's oak/charcoal/cream palette.
 */
export function SceneImage({
  scene,
  media,
  className,
  priority,
}: {
  scene: Scene;
  media: MediaSlot;
  className?: string;
  priority?: boolean;
}) {
  if (media.src) {
    return (
      <div className={className} style={{ position: "relative" }}>
        <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority={priority} />
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label={media.alt}>
      {scene === "living-room" ? <LivingRoomScene /> : <DiningRoomScene />}
    </div>
  );
}

const CREAM = "#f1e9dd";
const CREAM_DEEP = "#e7dac6";
const OAK = "#a9805c";
const OAK_LIGHT = "#c4a179";
const OAK_DARK = "#7d5a3a";
const CHARCOAL = "#2a2622";
const CHARCOAL_SOFT = "#454039";
const WARM_WHITE = "#faf7f2";

function LivingRoomScene() {
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="600" fill={CREAM} />
      <rect y="440" width="800" height="160" fill={CREAM_DEEP} />

      <rect x="60" y="60" width="230" height="330" fill={WARM_WHITE} stroke={OAK_DARK} strokeWidth="4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x="72" y={78 + i * 30} width="206" height="12" rx="6" fill={i % 2 === 0 ? OAK : OAK_LIGHT} opacity={0.85} />
      ))}

      <path d="M40 50 Q30 220 46 400 L70 400 Q56 220 66 50 Z" fill={OAK_LIGHT} opacity={0.55} />
      <path d="M300 50 Q310 220 294 400 L270 400 Q284 220 274 50 Z" fill={OAK_LIGHT} opacity={0.55} />
      <rect x="30" y="46" width="290" height="10" fill={CHARCOAL_SOFT} />

      <line x1="560" y1="0" x2="560" y2="90" stroke={CHARCOAL_SOFT} strokeWidth="3" />
      <ellipse cx="560" cy="100" rx="70" ry="14" fill="none" stroke={CHARCOAL_SOFT} strokeWidth="3" />
      {[500, 530, 560, 590, 620].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="100" x2={x} y2="118" stroke={CHARCOAL_SOFT} strokeWidth="2" />
          <circle cx={x} cy="124" r="5" fill={OAK_LIGHT} />
        </g>
      ))}

      <rect x="420" y="360" width="330" height="110" rx="18" fill={CREAM_DEEP} stroke={CHARCOAL_SOFT} strokeWidth="3" />
      <rect x="420" y="330" width="330" height="50" rx="20" fill={CREAM_DEEP} stroke={CHARCOAL_SOFT} strokeWidth="3" />
      <circle cx="470" cy="355" r="26" fill={CHARCOAL_SOFT} opacity={0.35} />
      <circle cx="540" cy="352" r="24" fill={OAK} opacity={0.4} />
      <circle cx="610" cy="355" r="26" fill={CHARCOAL_SOFT} opacity={0.35} />

      <rect x="470" y="490" width="220" height="16" fill={CHARCOAL} />
      <rect x="490" y="506" width="8" height="40" fill={CHARCOAL} />
      <rect x="660" y="506" width="8" height="40" fill={CHARCOAL} />

      <ellipse cx="560" cy="482" rx="20" ry="10" fill={WARM_WHITE} stroke={OAK_DARK} strokeWidth="2" />
      <path d="M545 478 Q535 440 555 420 M560 478 Q560 430 560 405 M575 478 Q590 445 578 415" fill="none" stroke={OAK_DARK} strokeWidth="3" strokeLinecap="round" />

      <line x1="760" y1="230" x2="760" y2="470" stroke={CHARCOAL_SOFT} strokeWidth="3" />
      <path d="M735 200 L785 200 L775 232 L745 232 Z" fill={CREAM_DEEP} stroke={CHARCOAL_SOFT} strokeWidth="2" />
    </svg>
  );
}

function DiningRoomScene() {
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="600" fill={CREAM} />
      <rect y="430" width="800" height="170" fill={CREAM_DEEP} />

      <rect x="290" y="40" width="220" height="260" fill={WARM_WHITE} stroke={OAK_DARK} strokeWidth="4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="302" y={56 + i * 30} width="196" height="12" rx="6" fill={i % 2 === 0 ? OAK : OAK_LIGHT} opacity={0.85} />
      ))}

      <line x1="400" y1="0" x2="400" y2="150" stroke={CHARCOAL_SOFT} strokeWidth="3" />
      <ellipse cx="400" cy="168" rx="55" ry="18" fill={OAK_LIGHT} opacity={0.5} stroke={OAK_DARK} strokeWidth="2" />

      <ellipse cx="400" cy="420" rx="180" ry="60" fill={CHARCOAL} opacity={0.9} />
      <ellipse cx="400" cy="408" rx="180" ry="60" fill={CHARCOAL_SOFT} />

      {[
        [190, 400], [610, 400], [260, 480], [540, 480], [400, 500], [400, 330],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 22} y={y - 30} width="44" height="60" rx="10" fill={CREAM_DEEP} stroke={CHARCOAL_SOFT} strokeWidth="2" />
      ))}

      <ellipse cx="400" cy="392" rx="18" ry="9" fill={WARM_WHITE} stroke={OAK_DARK} strokeWidth="2" />
      <path d="M388 388 Q378 355 392 335 M400 388 Q400 345 400 320 M412 388 Q424 358 410 330" fill="none" stroke={OAK_DARK} strokeWidth="3" strokeLinecap="round" />

      {[
        [190, 400], [610, 400], [260, 480],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y - 20} r="10" fill={WARM_WHITE} stroke={OAK_DARK} strokeWidth="1.5" />
      ))}
    </svg>
  );
}
