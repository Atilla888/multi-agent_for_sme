import type { SVGProps } from "react";

/** 24 px outline icon set from the Figma design system (Icon/*), drawn with currentColor. */
const paths = {
  home: "M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9",
  message: "M4 5h16v11H9l-5 4V5Z",
  alert: "M12 4 2.5 20h19L12 4Zm0 6v4m0 3h.01",
  package: "M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v0M4 7l8 4 8-4M12 11v10",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-16a3.5 3.5 0 0 1 0 7m2 9a6 6 0 0 0-3-5.2",
  chart: "M4 4v16h16M8 16v-4m4 4V8m4 8v-6",
  trend: "M3 17l6-6 4 4 8-8m-6 0h6v6",
  book: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.5 7.5 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.4 7.4 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.4 7.4 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4h4",
  send: "M21 3 3 10.5l7 3 3 7L21 3Zm-11 10.5L21 3",
  menu: "M4 6h16M4 12h16M4 18h16",
  bot: "M5 9h14v10H5V9Zm7-5v5M9 14h.01M15 14h.01M2 13v3m20-3v3",
  chevronRight: "m9 5 7 7-7 7",
  chevronLeft: "m15 5-7 7 7 7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  logout: "M10 4H5v16h5m4-12 4 4-4 4m4-4H9",
  check: "m5 12.5 4.5 4.5L19 7",
  box: "M4 4h16v16H4V4Zm0 5h16M9 9v11",
  plug: "M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4",
  shield: "M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z",
  user: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0",
  x: "M6 6l12 12M18 6 6 18",
  filter: "M4 5h16l-6 7.5V19l-4 2v-8.5L4 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
} as const;

export type IconName = keyof typeof paths;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  readonly name: IconName;
  readonly size?: number;
}

export function Icon({ name, size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
