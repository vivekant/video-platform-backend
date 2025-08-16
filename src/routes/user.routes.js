import { Router } from 'express'
import { resisterUser , loginUser,logoutUser,refreshAccessToken,changePassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCover,getWatchHistory,getUserChannelProfile} from '../controllers/user.controller.js'
import { upload } from "../middleware/multer.middleware.js"
import { verifyjwt } from '../middleware/auth.middleware.js';

const router = Router();

// just running a function on post request hitting on 
// http://localhost:5000//api/v1/users/resister
// router.route('/resister').post(
    
//     resisterUser
// )

// run middleware before running resister function on hitting post request on above link
router.route('/resister').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),

    resisterUser
)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyjwt,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyjwt,changePassword)
router.route('/get-current-user').get(verifyjwt,getCurrentUser)
router.route('/update-account-details').patch(verifyjwt,updateAccountDetails)

router.route('/update-avatar').patch(
    verifyjwt,
    upload.fields([{
        name:'avatar',
        maxCount:1
    }]),
    updateAvatar)
router.route('/update-cover').patch(
    verifyjwt,
    upload.fields([{
        name:'coverImage',
        maxCount:1
    }]),
    updateCover)

// router.route('/update-avatar').patch(
//     verifyjwt,
//     upload.single("avatar"),
//     updateAvatar

// )
// router.route('/update-cover').patch(
//     verifyjwt,
//     upload.single("coverImage"),
//     updateCover
// )


router.route('/c/:username').get(verifyjwt,getUserChannelProfile)
router.route('/watch-history').get(verifyjwt,getWatchHistory)
router.route('/:name').get((req,res) => {
  res.send(`hello ${req.params.name}`)
}
)
export default router;



