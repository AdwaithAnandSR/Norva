import { Router } from "express";

import {
    followUser,
    unfollowUser
} from "../controllers/user/follow.controller.js";
import { getUserProfile } from "../controllers/user/user.controller.js"
import { getMyProfile, getUserPosts, updateProfile } from "../controllers/user/profile.controller.js";


const router = Router()

router.get("/me", getMyProfile);
router.patch("/me", updateProfile);
router.get("/me/posts", (req, res) => {
    req.params.id = req.user.userId;
    getUserPosts(req, res);
})

router.get("/:id", getUserProfile);
router.post("/:id/follow", followUser);
router.delete("/:id/follow", unfollowUser);

export default router;
