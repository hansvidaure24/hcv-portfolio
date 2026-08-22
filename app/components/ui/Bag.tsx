import Image from "next/image";

type BagProps = {
  className?: string;
};

export default function Bag({ className }: BagProps) {
  return (
    <div className={className}>
      <Image
        src="/graphics/bag.png"
        alt=""
        fill
        sizes="200px"
        style={{ objectFit: "contain", zIndex: 1 }}
        aria-hidden="true"
      />
    </div>
  );
}
