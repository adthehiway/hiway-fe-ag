"use client";

interface Props extends React.SVGProps<SVGSVGElement> {
  name: "google" | "photo" | "logout" | "close" | "profile-round" | string;
}

export function Icon({ name, ...props }: Props) {
  return (
    <svg {...props}>
      <use xlinkHref={`/icons/sprite.svg?v10#${name}`} />
    </svg>
  );
}
