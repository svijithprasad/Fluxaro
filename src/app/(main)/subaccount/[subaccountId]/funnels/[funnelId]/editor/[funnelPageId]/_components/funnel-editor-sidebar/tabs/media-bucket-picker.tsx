"use client";
import { getMedia } from "@/lib/queries";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  subaccountId: string;
  onSelect: (url: string) => void;
};

type MediaFile = {
  id: string;
  name: string;
  link: string;
  type: string | null;
};

const MediaBucketPicker = ({ subaccountId, onSelect }: Props) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchMedia = useCallback(async () => {
    if (!subaccountId) return;
    setIsLoading(true);
    try {
      const data = await getMedia(subaccountId);
      if (data) {
        setMediaFiles(data);
      }
    } catch (e) {
      console.error("Failed to load media", e);
    }
    setIsLoading(false);
  }, [subaccountId]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  return (
    <div className="flex flex-col gap-2 mt-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-left px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
      >
        {isOpen ? "▼ Hide Media Bucket" : "▶ Select from Media Bucket"}
      </button>
      {isOpen && (
        <div className="max-h-[250px] overflow-y-auto border rounded-md p-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Loading media...
            </p>
          ) : mediaFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No media files found. Upload images in the Media section first.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="cursor-pointer rounded-md overflow-hidden border hover:border-primary transition-colors group"
                  onClick={() => {
                    onSelect(file.link);
                    setIsOpen(false);
                  }}
                >
                  <div className="relative w-full h-20">
                    <Image
                      src={file.link}
                      alt={file.name}
                      fill
                      className="object-cover group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground p-1 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaBucketPicker;
