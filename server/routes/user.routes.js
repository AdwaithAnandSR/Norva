import { Router } from "express";

import {
    followUser,
    unfollowUser
} from "../controllers/user/follow.controller.js";
import { getUserProfile } from "../controllers/user/user.controller.js";

const router = Router();

router.get("/:id", getUserProfile);
router.post("/:id/follow", followUser);
router.delete("/:id/follow", unfollowUser);

export default router;
