import express from "express"
import { authMiddleware } from "../middlewares/auth-middleware"
import { UserController } from "../controllers/user-controller"

export const privateRouter = express.Router()

privateRouter.use(authMiddleware)

/* =========================
*  USER
========================= */
// Get User Profile (Only self)
privateRouter.get("/users/me", UserController.getMe);

// Edit User Profile (Only self)
privateRouter.patch("/users/me", UserController.updateMe);


/* =========================
*  FRIEND SYSTEM
========================= */
//TODO: Implement Friend System
// Search Friend
privateRouter.get("/users/search", UserController.searchUsers);

// Look at Friend's Profile
privateRouter.get("/users/:id/profile", UserController.getUserProfile);


/* =========================
*  HISTORY
========================= */
// History for one day
privateRouter.get("/activities/day", ActivityController.getActivityDay);

// History based on range
privateRouter.get("/activities/day/range", ActivityController.getActivityDayRange);
/*
    GET /activities/daily?date=YYYY-MM-DD
    GET /activities/daily/range?from=YYYY-MM-DD&to=YYYY-MM-DD
*/


/* =========================
*  SESSION
========================= */

//* === SESSION EDITOR ===
// Create new session
privateRouter.post("/sessions", SessionController.createSession);

/*  Get all sessions ONLY when:
    - visibility = PUBLIC
    - (is_friend(creator) && visibility = FRIEND_ONLY)
*/
privateRouter.get("/sessions", SessionController.getSessions);

/*  Valid ONLY when:
    - visibility = PUBLIC
    - (is_friend(creator) && visibility = FRIEND_ONLY)
*/
privateRouter.get("/sessions/:sessionId", SessionController.getSessionDetail);

/*  Edit session ONLY when:
    - status == PLANNED
        -> "status" = "CANCELLED"
        -> title, desc, time, image, data change
    - status == ONGOING 
        -> "status" = "FINISHED"
*/
privateRouter.patch("/sessions/:sessionId", SessionController.updateSession);


//* === SESSION PARTICIPATION ===
/*  Join session, ONLY when:
    - The schedule doesn't conflict with user's other joined session
    - (Session status == PLANNED) || (Session status == ONGOING && Participant Status == LEFT)
*/
privateRouter.post("/sessions/:sessionId/participants", ParticipantController.joinSession);

/*  Update progress on session, ONLY when:
    - session status == ONGOING && user status == JOINED
        -> leave
    - user status == LEFT
        -> user status JOINED
*/
privateRouter.patch("/sessions/:sessionId/participants/status", ParticipantController.editParticipantStatus);

/*  Update progress on session, ONLY when:
    - session status == ONGOING && user status == JOINED
        -> Step increment
*/
privateRouter.patch("/sessions/:sessionId/participants/step", ParticipantController.addStep);


/*  Session participants, when:
    - visibility == PUBLIC
    - visibility == FRIENDONLY && is_friend(creator)
    - visibility == INVITEONLY && participate_in(session)
*/
privateRouter.get("/sessions/:sessionId/participants", ParticipantController.getParticipants);

// Get leaderboard, ONLY when participate_in(session) 
privateRouter.get("/sessions/:sessionId/leaderboard", LeaderboardController.getSessionLeaderboard);


//* === USER SESSION MANAGEMENT ===
// My sessions that I joined
privateRouter.get("/users/me/sessions", UserController.getMySessions);

// Active session, returns ONLY 1 session or null
privateRouter.get("/users/me/sessions/active", UserController.getMyActiveSession);


