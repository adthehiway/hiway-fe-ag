import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaByStatus } from "@/hooks/useMedia";
import { IMedia, MediaStatus } from "@/types";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SearchMediaInputProps {
  mediaProp?: IMedia;
  onSelectMedia: (media: IMedia) => void;
  error?: string;
  setSelectedMedia: (media: IMedia | undefined) => void;
  selectedMedia: IMedia | undefined;
}

const SearchMediaInput: React.FC<SearchMediaInputProps> = ({
  mediaProp,
  onSelectMedia,
  error,
  setSelectedMedia,
  selectedMedia,
}) => {
  const [search, setSearch] = useState("");
  const { mediaList, isLoading: mediaLoading } = useMediaByStatus(
    [MediaStatus.READY],
    5,
    search
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (mediaProp) {
      handleSelectMedia(mediaProp);
    }
  }, [mediaProp]);

  const handleSearchFocus = () => setDropdownOpen(true);
  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to allow click on dropdown
    setTimeout(() => setDropdownOpen(false), 150);
  };
  const handleSelectMedia = (media: IMedia) => {
    onSelectMedia(media);
    setSelectedMedia(media);
    setDropdownOpen(false);
  };

  return (
    <div className="mb-4 relative">
      <Label className="mb-2">Select Content</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={18} />
        </span>
        <Input
          className="pl-10"
          placeholder="Search your library..."
          value={
            mediaProp
              ? mediaProp?.metadata?.title || mediaProp?.name
              : selectedMedia?.metadata?.title || selectedMedia?.name || search
          }
          disabled={!!mediaProp}
          onFocus={handleSearchFocus}
          onBlur={(e) =>
            handleSearchBlur(e as React.FocusEvent<HTMLInputElement>)
          }
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedMedia(undefined);
          }}
          ref={inputRef}
        />
        {/* Dropdown */}
        {dropdownOpen && !selectedMedia && (
          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-muted rounded shadow-lg z-10 border ">
            {mediaLoading ? (
              <div className="p-4 text-muted-foreground text-center">
                Loading...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-4 text-muted-foreground text-center">
                No content found
              </div>
            ) : (
              <ul className="divide-y">
                {mediaList.map((m) => (
                  <li
                    key={m.id}
                    className="px-4 py-2 cursor-pointer hover:bg-accent/10"
                    onMouseDown={() => handleSelectMedia(m)}
                  >
                    <div className="font-semibold">
                      {m.metadata?.title || m.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.metadata?.releaseDate
                        ? new Date(m.metadata?.releaseDate).toLocaleDateString()
                        : new Date(m.createdAt).toLocaleDateString()}
                      {m.metadata?.genre?.length && (
                        <> • {m.metadata?.genre?.join(", ")}</>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
};

export default SearchMediaInput;
