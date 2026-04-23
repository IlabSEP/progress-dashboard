import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import { Doc } from "../../convex/_generated/dataModel";

interface FileDoc {
  storageId: Id<"_storage">;
  fileName: string;
  mimeType: string;
}

export function UpdateForm({ existing }: { existing?: Doc<"updates"> | null }) {
  const isEdit = existing && !existing.isLocked;
  const [githubCommits, setGithubCommits] = useState(existing?.githubCommits ?? "");
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl ?? "");
  const [writtenUpdate, setWrittenUpdate] = useState(existing?.writtenUpdate ?? "");
  const [documents, setDocuments] = useState<FileDoc[]>(
    (existing?.documents as FileDoc[]) ?? []
  );
  const [submitting, setSubmitting] = useState(false);

  const submitMutation = useMutation(api.updates.submit);
  const editMutation = useMutation(api.updates.edit);
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasContent =
    githubCommits.trim() ||
    videoUrl.trim() ||
    documents.length > 0 ||
    writtenUpdate.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContent) return;
    setSubmitting(true);
    try {
      const data = {
        githubCommits: githubCommits.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        documents: documents.length > 0 ? documents : undefined,
        writtenUpdate: writtenUpdate.trim() || undefined,
      };

      if (isEdit) {
        await editMutation({ updateId: existing._id, ...data });
        toast({ title: "Update edited and re-submitted" });
      } else {
        await submitMutation(data);
        toast({ title: "Update submitted successfully" });
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: err.message ?? "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="githubCommits">GitHub Commits</Label>
        <Textarea
          id="githubCommits"
          value={githubCommits}
          onChange={(e) => setGithubCommits(e.target.value)}
          placeholder="Paste commit links or repo URLs..."
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="videoUrl">Video Update URL</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube or Google Drive link..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Documents</Label>
        <FileUpload files={documents} onChange={setDocuments} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="writtenUpdate">Written Update</Label>
        <Textarea
          id="writtenUpdate"
          value={writtenUpdate}
          onChange={(e) => setWrittenUpdate(e.target.value)}
          placeholder="Describe your progress..."
          rows={6}
        />
      </div>

      <Button type="submit" disabled={!hasContent || submitting}>
        {submitting ? "Submitting..." : isEdit ? "Re-submit Update" : "Submit Update"}
      </Button>
    </form>
  );
}
