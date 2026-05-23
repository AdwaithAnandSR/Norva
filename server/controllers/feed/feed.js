import Post from "../../models/post.models.js";

/**
 * GET /post/getFeed
 * Cursor-based infinite feed. Cursor = { createdAt, _id } of the last seen post.
 * Returns posts sorted newest-first with author info populated.
 */
export const getFeed = async (req, res) => {
    try {
        const { cursor, limit = 10 } = req.body;

        // Build the cursor query — page backwards through time
        const query = cursor
            ? {
                  $or: [
                      {
                          createdAt: {
                              $lt: new Date(cursor.createdAt)
                          }
                      },
                      // tie-break on _id so we never miss posts created in the same ms
                      {
                          createdAt: new Date(cursor.createdAt),
                          _id: {
                              $lt: cursor._id
                          }
                      }
                  ]
              }
            : {};

        // Fetch one extra to know if there's a next page
        const posts = await Post.find(query)
            .sort({
                createdAt: -1,
                _id: -1
            })
            .limit(Number(limit) + 1)
            .populate("userId", "username fullname")
            .lean();

        const hasMore = posts.length > Number(limit);
        if (hasMore) posts.pop();

        const nextCursor = hasMore
            ? {
                  createdAt: posts[posts.length - 1].createdAt,
                  _id: posts[posts.length - 1]._id
              }
            : null;

        return res.status(200).json({
            success: true,
            posts,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error("Error fetching feed:", error);
        return res.status(500).json({
            success: false,
            message: "SERVER_ERROR"
        });
    }
};

export const createFeed = async (req, res) => {
    try {
        const { title, description, tags, mediaType, url, mediaPublicId } =
            req.body;

        const post = await Post.create({
            title,
            description,
            tags,
            mediaType,
            url,
            mediaPublicId,
            userId: req.user.userId
        });

        res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.error("Error while creating post:", error);
        res.status(500).json({
            success: false
        });
    }
};
