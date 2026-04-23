import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "../../convex/_generated/dataModel";
import { Cross2Icon } from "@radix-ui/react-icons";

interface FileDoc {
  storageId: Id<"_storage">;
  fileName: string;
  mimeType: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES =
  ".pdf,.png,.jpg,.jpeg,.mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v";

export function FileUpload({
  files,
  onChange,
}: {
  files: FileDoc[];
  onChange: (files: FileDoc[]) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const newFiles: FileDoc[] = [];
      for (const file of Array.from(selectedFiles)) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds 100MB limit`);
          continue;
        }
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        newFiles.push({
          storageId,
          fileName: file.name,
          mimeType: file.type,
        });
      }
      onChange([...files, ...newFiles]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleUpload}
          className="text-sm"
          disabled={uploading}
        />
        {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span>{file.fileName}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => removeFile(i)}
              >
                <Cross2Icon className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
