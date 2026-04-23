import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

export function TagSelector({ teamId }: { teamId: Id<"users"> }) {
  const allTags = useQuery(api.tags.list);
  const teamTags = useQuery(api.tags.getTagsForTeam, { teamId });
  const assignTag = useMutation(api.tags.assignToTeam);
  const removeTag = useMutation(api.tags.removeFromTeam);

  if (!allTags || !teamTags) return <p className="text-sm text-muted-foreground">Loading tags...</p>;

  const teamTagIds = new Set(
    teamTags.filter((t): t is Doc<"tags"> => t !== null).map((t) => t._id)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const isAssigned = teamTagIds.has(tag._id);
        return (
          <label
            key={tag._id}
            className="flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={isAssigned}
              onChange={async () => {
                if (isAssigned) {
                  await removeTag({ teamId, tagId: tag._id });
                } else {
                  await assignTag({ teamId, tagId: tag._id });
                }
              }}
            />
            {tag.name}
          </label>
        );
      })}
      {allTags.length === 0 && (
        <p className="text-sm text-muted-foreground">No tags created yet.</p>
      )}
    </div>
  );
}
