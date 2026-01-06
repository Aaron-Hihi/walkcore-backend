import express from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { UserController } from "../controllers/user-controller"
import { FriendController } from "../controllers/friend-controller"
import { UserItemController } from "../controllers/userItem-controller"
import { ShopItemController } from "../controllers/shopItem-controller"
import { UserAchievementController } from "../controllers/userAchievement-controller"
import { AchievementController } from "../controllers/achievement-controller"
import { ActivityController } from "../controllers/user-daily-activity-controller"

export const privateRouter = express.Router()

privateRouter.use(authMiddleware)

/* =========================
*  USER
========================= */
// Get User Profile (Only self)
privateRouter.get("/users/me", UserController.getMyProfile);
privateRouter.get("/users/me/stats", UserController.getMyStats);
privateRouter.get("/users/me/overview", UserController.getMyOverview);

// Edit User Profile (Only self)
privateRouter.patch("/users/me", UserController.updateMyProfile);

// Logout from device (Update token version)
privateRouter.patch("/users/logout", UserController.logout)

/* =========================
*  SOCIAL SYSTEM
========================= */
// TODO: Implement Search User
privateRouter.get("/users", UserController.getAllUsers);

// Look at another user's Profile
privateRouter.get("/users/:id", UserController.getUserProfile);

// Add friend
privateRouter.post("/friends/:userId", FriendController.sendRequest);

/*  Change status of a friend
    - ONLY when user is addressee
        -> PENDING to ACCEPTED
    - All can change ACCEPTED to BLOCKED
*/
privateRouter.post("/friends/:requestId/accept", FriendController.acceptFriend);

// Delete request ID when rejected
privateRouter.post("/friends/:requestId/reject", FriendController.rejectFriend);

// TODO: Implement Block System
//privateRouter.post("/friends/:requestId/block", FriendController.blockFriend);

// Get all friends
privateRouter.get("/friends", FriendController.getFriendAll);

// Get friend requests
privateRouter.get("/friends/pending", FriendController.getFriendRequests);

/* =========================
*  HISTORY
========================= */
// History for one day
privateRouter.get("/activities/day", ActivityController.getActivityOn);

// History based on range
privateRouter.get("/activities/day/range", ActivityController.getActivityOnRange);
/*
    GET /activities/daily?date=YYYY-MM-DD
    GET /activities/daily/range?from=YYYY-MM-DD&to=YYYY-MM-DD
*/


// /* =========================
// *  SESSION
// ========================= */

// //* === SESSION EDITOR ===
// // Create new session
// privateRouter.post("/sessions", SessionController.createSession);

// /*  Get all sessions ONLY when:
//     - visibility = PUBLIC
//     - (is_friend(creator) && visibility = FRIEND_ONLY)
// */
// privateRouter.get("/sessions", SessionController.getSessions);

// /*  Valid ONLY when:
//     - visibility = PUBLIC
//     - (is_friend(creator) && visibility = FRIEND_ONLY)
// */
// privateRouter.get("/sessions/:sessionId", SessionController.getSessionDetail);

// /*  Edit session ONLY when:
//     - status == PLANNED
//         -> "status" = "CANCELLED"
//         -> title, desc, time, image, data change
//     - status == ONGOING 
//         -> "status" = "FINISHED"
// */
// privateRouter.patch("/sessions/:sessionId", SessionController.updateSession);


// //* === SESSION PARTICIPATION ===
// /*  Join session, ONLY when:
//     - The schedule doesn't conflict with user's other joined session
//     - (Session status == PLANNED) || (Session status == ONGOING && Participant Status == LEFT)
// */
// privateRouter.post("/sessions/:sessionId/participants", ParticipantController.joinSession);

// /*  Update progress on session, ONLY when:
//     - session status == ONGOING && user status == JOINED
//         -> leave
//     - user status == LEFT
//         -> user status JOINED
// */
// privateRouter.patch("/sessions/:sessionId/participants/status", ParticipantController.editParticipantStatus);

// /*  Update progress on session, ONLY when:
//     - session status == ONGOING && user status == JOINED
//         -> Step increment
// */
// privateRouter.patch("/sessions/:sessionId/participants/step", ParticipantController.addStep);


// /*  Session participants, when:
//     - visibility == PUBLIC
//     - visibility == FRIENDONLY && is_friend(creator)
//     - visibility == INVITEONLY && participate_in(session)
// */
// privateRouter.get("/sessions/:sessionId/participants", ParticipantController.getParticipants);

// // Get leaderboard, ONLY when participate_in(session) 
// privateRouter.get("/sessions/:sessionId/leaderboard", LeaderboardController.getSessionLeaderboard);


// //* === USER SESSION MANAGEMENT ===
// // My sessions that I joined
// privateRouter.get("/users/me/sessions", UserController.getMySessions);

// // Active session, returns ONLY 1 session or null
// privateRouter.get("/users/me/sessions/active", UserController.getMyActiveSession);


/* =========================
* ACHIEVEMENT DEFINITION (ADMIN/SYSTEM)
========================= */
privateRouter.get("/achievement", AchievementController.getAllAchievements);
privateRouter.post("/achievement", AchievementController.createAchievement);
privateRouter.put("/achievement/:achievementId", AchievementController.updateAchievement);
privateRouter.delete("/achievement/:achievementId", AchievementController.deleteAchievement);

/* =========================
* USER ACHIEVEMENT PROGRESS
========================= */
privateRouter.get("/user_achievement", UserAchievementController.getAllUserAchievements);
privateRouter.get("/user_achievement/:userAchievementListId", UserAchievementController.getUserAchievement);
privateRouter.post("/user_achievement/:achievementId", UserAchievementController.createUserAchievement);
privateRouter.put("/user_achievement/:userAchievementListId", UserAchievementController.updateUserAchievement);
privateRouter.delete("/user_achievement/:userAchievementListId", UserAchievementController.deleteUserAchievement);

/* =========================
* SHOP ITEM MANAGEMENT
========================= */
privateRouter.get("/shop_item", ShopItemController.getAllShopItems);
privateRouter.get("/shop_item/:shopItemId", ShopItemController.getShopItem);
privateRouter.post("/shop_item", ShopItemController.createShopItem);
privateRouter.put("/shop_item/:shopItemId", ShopItemController.updateShopItem);
privateRouter.delete("/shop_item/:shopItemId", ShopItemController.deleteShopItem);

/* =========================
* USER INVENTORY (SHOP ITEMS)
========================= */
privateRouter.get("/user_item", UserItemController.getAllUserItems);
privateRouter.get("/user_item/:userItemId", UserItemController.getUserItem);
privateRouter.post("/user_item/:shopItemId", UserItemController.createUserItem);
privateRouter.put("/user_item/:userItemId", UserItemController.updateUserItem);
privateRouter.delete("/user_item/:userItemId", UserItemController.deleteUserItem);