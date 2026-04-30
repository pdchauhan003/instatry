import { Post,Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export const getAllPostComments = async (postId, options = {}) => {
    try {
        await connectDB();
        const {
          limit,
          cursor, // { createdAt: string, _id: string }
        } = options || {};

        const query = { post: postId };

        if (cursor?.createdAt && cursor?._id) {
          const cursorDate = new Date(cursor.createdAt);
          if (!Number.isNaN(cursorDate.getTime())) {
            query.$or = [
              { createdAt: { $lt: cursorDate } },
              { createdAt: cursorDate, _id: { $lt: cursor._id } },
            ];
          }
        }

        const requestedLimit =
          typeof limit === "number" && Number.isFinite(limit) ? limit : undefined;

        // If no limit passed, keep existing behavior: return all comments.
        if (!requestedLimit) {
          const commentData = await Comment.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: "author", select: "username image" });
          return commentData || [];
        }

        const safeLimit = Math.max(1, Math.min(50, Math.floor(requestedLimit)));
        const docs = await Comment.find(query)
          .sort({ createdAt: -1, _id: -1 })
          .limit(safeLimit + 1)
          .populate({ path: "author", select: "username image" });

        const hasMore = docs.length > safeLimit;
        const items = hasMore ? docs.slice(0, safeLimit) : docs;
        const last = items[items.length - 1];
        const nextCursor = last
          ? { createdAt: last.createdAt?.toISOString?.() ?? last.createdAt, _id: String(last._id) }
          : null;

        return { items, hasMore, nextCursor };
    } catch (error) {
        console.error("Error in getAllPostComments controller:", error);
        throw error;
    }
}
