import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from '../utils/apiResponse.js'
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { asynchandler } from "../utils/asynchandler.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const getPublicIdFromUrlOfFileOfCloudinary = (url) => {
  const parts = url.split("/");
  const publicIdWithExtension = parts[parts.length - 1];
  const publicId = publicIdWithExtension.split(".")[0];
  return publicId;
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    // generation access and refresh token
    // user instead of User because User represent whole collection but here user represent particular user and each user have generateAccessToken and generateRefreshToken  methods
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();

    // setting refresh token value of user
    user.refreshToken = RefreshToken;
    // if you just write user.save() then all validation check again run(like password , username etc will check again that is empty or not etc) , to prevent this just give a object inside it that is validateBeforeToken:false --> it means just save that i give you dont do validation, i know what i am doint with user database.
    user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while generation access and refresh token!!!"
    );
  }
};

const resisterUser = asynchandler(
  async (req, res) => {
  // steps for resister the user
  // get user details from frontend
  // validate - not empty
  // check user already exist or not
  // check for  profile image and avatar image
  // upload it to cloudinary
  // create user object -- create entry in db
  // remove password and refresh token from response
  // check for user creation
  // return response

  // get data from user
  // destructuring the data of req.body
  const { fullName, username, email, password } = req.body;
  console.log(`fullName: ${fullName}`);
  console.log(`username: ${username}`);
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);

  // checkin field
  // (first way is use if(){} for each field )
  // if(fullName==""){
  //   throw new apiError(400,"abe fullName sahi se bhar nhi to vahi aake marunga")
  // }

  // second way is use some concept(just like map )
  if (
    [fullName, email, username, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All field required!!!");
  }

  // checking user is already existed or not
  // 1. here we check existense of user using username only
  // const existedUser=User.findOne({username})
  // 2. here if username or email will get matched then they send user exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user already exist");
  }

  // checking for avatar and coverImage
  // ? check if exist then proceed otherwise stop there and return
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath=req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  // the above way we are not using because of if coverImage is zero size array then coverImage[0] will give error, so it return undefined
  // we can also check as it avatar were checked but coverImage is not required true so if coverImage is not provided by user, then we have to proceed without giving error.
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // console.log('req.files');

  // console.log(req.files);
  // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // console.log('req.coverImage');

  // console.log(req.files.coverImage);

  // upload avatar and coverImage on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new apiError(400, "avatar is required!!!");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullname: fullName,
    password,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // removing password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // checking user is created or no
  if (!createdUser) {
    throw new apiError(500, "please try again!!!");
  }

  // sending response

  // first way and you can leave status , but its better to give for directally observable
  // res.status(201).json({createdUser})

  // second way
  res
    .status(201)
    .json(new apiResponse(200, createdUser, "user resistered successfully"));
}

);

const loginUser = asynchandler(async (req, res) => {
  // steps
  // take username/email from user
  // check username or email (if both are empty then throw error)
  // find user in our database using username or email (depends user provide what)
  // validate password with password of user in our database
  // generate access and re-fresh token
  // send these token to user in cookies

  // de-structuring data sent by user
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new apiError(400, "username or email is required!!!");
  }
  if (!password) {
    throw new apiError(400, "password is required!!!");
  }

  // finding user in our database
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "user does not exit!!!");
  }

  // checking password is correct or not
  const ispasswordValid = await user.isCorrectPassword(password);
  if (!ispasswordValid) {
    throw new apiError(401, "Invalid user credential!!!!");
  }

  // generation and then accessing the refreshToken and accessToken
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // by writting following line , cookies can be change from server side not from frontend side
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          RefreshToken,
          AccessToken,
        },
        "user logged In successfully!!!"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  // todo for logout
  // delete the refreshToken from user and make it undefined
  // there are two ways to do it
  // 1. find user--> update the value of refreshToken-->then save it
  // const userdata= await User.findById(req.user._id)
  // userdata.refreshToken=undefined
  // await userdata.save()

  // the second way is use the findByIdAndUpdate , which take a id and key that you want to update, it automatically update the value and save it

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    // by adding following object, updated user will come in response
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out successfully!!!!"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const InCommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!InCommingRefreshToken) {
    throw new apiError(
      400,
      "refreshToken is not comming in refreshAccessToken!!!"
    );
  }
  try {
    const decodedToken = await jwt.verify(
      InCommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(400, "Invalid RefreshToken");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    if (InCommingRefreshToken !== user.refreshToken) {
      throw new apiError(400, "Invalid refresh token!!!");
    }
    const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
      user?._id
    );

    return res
      .status(200)
      .cookie("refreshToken", RefreshToken, options)
      .cookie("accessToken", AccessToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken: AccessToken, refreshToken: RefreshToken },
          "accessToken refreshed!!!!"
        )
      );
  } catch (error) {
    throw new apiError(400, error?.message || "Invalid refresh Token!!!");
  }
});

const changePassword = asynchandler(async (req, res) => {
  // when user is trying to change the password means user already loggedIn
  // thats why we are not checking accesstoken

  // steps
  // we will add a middleware(verifyjwt in auth.middleware.js) before changing password who verify the user, in this verification process is verification get success then this add user data in req
  // take old and new password from user
  // if you are taking confirm password also then match new and confirm if matched then proceed otherwise give error
  // we take id from user data in req which is came due to verifyjwt middleware
  // finding user in our database
  // now check old password and password in database match or not using isPasswordCorrect method of user (too se go in user.models.js)
  // if old and database password of user matched then update password of user and save with validateBeforeSave:false
  // finally send res with password changed successfully!!!

  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!(newPassword === confirmPassword)) {
    throw new apiError(400, "newPassword and confirmPassword not matching!!");
  }

  const user = await User.findById(req.user?._id);
  const isOldPasswordCorrect = await user.isCorrectPassword(oldPassword);
  // console.log({oldPassword,isOldPasswordCorrect});

  if (!isOldPasswordCorrect) {
    throw new apiError(400, "Invalid Old password");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new apiResponse(200, {}, "password changed successfully!!!"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "user fetched successfully!!!"));
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new apiError(400, "Fill the fullName and email!!!");
  }
  const update = {};
  if (fullName) {
    update.fullname = fullName;
  }
  if (email) {
    update.email = email;
  }
  // console.log(update);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: update,
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        user,
        `${Object.keys(update)} updated successfully!!!`
      )
    );
});

const updateAvatar = asynchandler(async (req, res) => {
  const oldAvatarUrl = req.user.avatar;

  const avatarLocalPath = req.files.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing!!!");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  if (user) {
    const publicId = await getPublicIdFromUrlOfFileOfCloudinary(oldAvatarUrl);
    const deleteresponse = await deleteOnCloudinary(publicId);
    console.log("old avatar deleted successfully!!!");
    console.log({ deleteresponse });
  }

  res
    .status(200)
    .json(new apiResponse(200, user, "avatar updated successfully!!!"));
});

const updateCover = asynchandler(async (req, res) => {
  const oldCoverUrl = req.user.coverImage;
  console.log(oldCoverUrl);

  const coverLocalPath = req.files.coverImage[0]?.path;
  if (!coverLocalPath) {
    throw new apiError(400, "cover file is missing!!!");
  }
  const cover = await uploadOnCloudinary(coverLocalPath);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: cover.url,
      },
    },
    { new: true }
  ).select("-password");

  if (user) {
    const publicIdOfOldCoverUrl =
      await getPublicIdFromUrlOfFileOfCloudinary(oldCoverUrl);
    const response = await deleteOnCloudinary(publicIdOfOldCoverUrl);
    console.log("old coverImage deleted successfully!!!!");
    console.log(response);
  }

  res
    .status(200)
    .json(new apiResponse(200, user, "coverImage updated successfully!!!"));
});

const getUserChannelProfile = asynchandler(async (req, res) => {
  // get username from user
  const { username } = req.params;
  if (!username?.trim()) {
    throw new apiError(400, "username is missing!!!");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subcribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subcribers",
        as: "subcribed",
      },
    },
    {
      $addFields: {
        subcribersCount: {
          $size: "$subcribers",
        },
        subscribedCount: {
          $size: "$subcribed",
        },
        isSubscribed: {
          // $in works for both array and object
          $cond: {
            if: { $in: [req.user?._id, "$subcribers.subcribers"] },
            then: true,
            else: false
          }
        }
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subcribersCount: 1,
        subscribedCount: 1,
        isSubscribed: 1
      }
    }

  ]);

  if (!channel?.length) {
    throw new apiError(404, "user not found")
  }
  return res.status(200)
    .json(
      new apiResponse(200, channel[0], "channel fetched successfully!!!!")
    )
});


const getWatchHistory = asynchandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // right now we are inside watchHistory field 
          {
            $lookup: {
              from: "users",

              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    },
    {

    }
  ])

  return res
    .status(200)
    .json(
      new apiResponse(200, user[0].watchHistory, "user Watche history fetched successfylly!!!")
    )
}
)




































// following two methods teach by sir, but i thing error in accessing localfile name

// const updateAvatar=asynchandler(async (req,res) => {
//   // console.log(req.files.avatar[0]?.path);
//   const avatarLocalPath=req.file.path
//   if(!avatarLocalPath){
//     throw new apiError(400,"Avatar file is missing!!!")
//   }
//   const avatar=await uploadOnCloudinary(avatarLocalPath)
// if(!avatar.url){
//   throw new apiError(500,
//   "error while updating avatar!!!"
//   )
// }

//   const user=await User.findByIdAndUpdate(
//     req.user._id,
//     {$set:{
//       avatar:avatar.url
//     }},
//     {new:true}
//   ).select("-password")

//   res
//   .status(200)
//   .json(
//     new apiResponse(
//       200,
//       user,
//       "avatar updated successfully!!!"
//     )
//   )

// }
// )

// const updateCover=asynchandler(async (req,res) => {
//   // console.log(req.files.avatar[0]?.path);
//   const CoverLocalPath=req.file.path
//   if(!CoverLocalPath){
//     throw new apiError(400,"Avatar file is missing!!!")
//   }
//   const cover=await uploadOnCloudinary(avatarLocalPath)
// if(!cover.url){
//   throw new apiError(500,
//   "error while updating cover!!!"
//   )
// }

//   const user=await User.findByIdAndUpdate(
//     req.user._id,
//     {$set:{
//       coverImage:avatar.url
//     }},
//     {new:true}
//   ).select("-password")

//   res
//   .status(200)
//   .json(
//     new apiResponse(
//       200,
//       user,
//       "Cover updated successfully!!!"
//     )
//   )

// }
// )

export {
  resisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCover,
  getUserChannelProfile,
  getWatchHistory
};
