import { Router } from "express";

import {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from "../controllers/user/follow.controller.js";

import {
    getMyProfile,
    getUserPosts,
    updateProfile,
    getUserProfile,
    updatePushToken
} from "../controllers/user/profile.controller.js";
import {
    searchUsers,
    getRecentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
} from "../controllers/user/search.controller.js";

const router = Router();

router.get("/me", getMyProfile);
router.patch("/me", updateProfile);
router.post("/push-token", updatePushToken);
router.get("/me/posts", (req, res) => {
    req.params.id = req.user.userId;
    getUserPosts(req, res);
});

// Search routes must be registered before the "/:id" catch-all below
router.get("/search", searchUsers);
router.get("/search/recent", getRecentSearches);
router.post("/search/recent/:id", addRecentSearch);
router.delete("/search/recent/:id", removeRecentSearch);
router.delete("/search/recent", clearRecentSearches);

router.get("/:id", getUserProfile);
router.get("/:id/posts", getUserPosts);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.post("/:id/follow", followUser);
router.delete("/:id/follow", unfollowUser);

export default router;
