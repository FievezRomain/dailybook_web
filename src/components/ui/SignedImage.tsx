import { ImageSigned } from "@/types/image";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

interface SignedImageProps {
  imageSigned?: ImageSigned;
  alt?: string;
  width: number;
  height: number;
  classNames?: string;
  rounded?: boolean;
  onErrorRefresh: () => void;
  fallbackText?: string;
}

export function SignedImage({
  imageSigned,
  alt,
  width,
  height,
  classNames,
  rounded = false,
  onErrorRefresh,
  fallbackText,
}: SignedImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageSigned?.url]);

  if (!imageSigned?.url || hasError) {
    return fallbackText ? (
      <span className="text-2xl text-white font-semibold">{fallbackText}</span>
    ) : (
      <Skeleton className={rounded ? "w-full h-full rounded-full" : "w-full h-full rounded-xl"} />
    );
  }

  return (
    <Image
      src={imageSigned.url}
      alt={alt || ""}
      className={classNames ? classNames : rounded ? "w-full h-full object-cover rounded-full" : "w-full h-full object-cover rounded-xl"}
      width={width}
      height={height}
      onError={() => {
        setHasError(true);
        if (onErrorRefresh) onErrorRefresh();
      }}
    />
  );
}