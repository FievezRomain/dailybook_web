import type { ImageSigned } from "@/types/image";
import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
  const [failedUrl, setFailedUrl] = useState<string>();
  const hasError = failedUrl === imageSigned?.url;

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
      className={classNames ? classNames : rounded ? "w-full h-full object-contain rounded-full" : "w-full h-full object-contain rounded-xl"}
      width={width}
      height={height}
      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
      onError={() => {
        setFailedUrl(imageSigned.url);
        if (onErrorRefresh) onErrorRefresh();
      }}
    />
  );
}
