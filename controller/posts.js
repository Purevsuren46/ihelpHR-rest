const Post = require("../models/Post");
const Like = require("../models/Like");
const Follow = require("../models/Follow");
const Cv = require("../models/Cv");
const path = require("path");

const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const Profile = require("../models/Profile");
const Comment = require("../models/Comment");
const sharp = require("sharp");

// api/v1/Posts
exports.getPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Post);

  const posts = await Post.find(req.query, select).populate({path: "createUser", select: "firstName lastName profile name"}).populate({path: 'sharePost', populate: {path: "createUser", select: "firstName lastName profile name"}})
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
    pagination,
  });
});

exports.getBoostPosts = asyncHandler(async (req, res, next) => {
  req.query.isBoost = true;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Post);

  const posts = await Post.find(req.query, select)
    .populate({path: "createUser", select: "firstName lastName profile name"})
    .populate('sharePost')
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
    pagination,
  });
});

exports.getUnboostPosts = asyncHandler(async (req, res, next) => {
  req.query.isBoost = false;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Post);

  const posts = await Post.find(req.query, select)
    .populate({path: "createUser", select: "firstName lastName profile name"})
    .populate('sharePost')
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
    pagination,
  });
});

exports.getCvPosts = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getPosts(req, res, next);
});

// api/v1/categories/:catId/Posts
exports.getFollowingPosts = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const follows = await Follow.find(req.query, select).sort(sort).limit(1000)

  const user = follows.map((item)=>item.followUser)
  user.push(req.params.id)
  // Pagination
  const pagination = await paginate(page, limit, Post.find({createUser: user, isBoost: false  }))


  const post = await Post.find({createUser: user, isBoost: false  }).limit(limit).sort(sort).skip(pagination.start - 1).populate({path: 'createUser', select: 'lastName firstName profile'}).populate({path: 'sharePost', populate: {path: 'createUser', select: 'lastName firstName profile'}})

  const boost = await Post.find({isBoost: true}).sort({"createdAt": -1})
  if (post[post.length - 1] != undefined) {
    const lik = await Like.find({createUser: req.userId, post: {$ne: null}, createdAt: {$gte: post[post.length - 1].createdAt}}).select('post')
    const like = []
    for (let i = 0; i < (lik.length); i++ ) {
      like.push(lik[i].post.toString())
    }
    if (boost != 0) {
      if (boost[page - 1] != undefined) {
        post.push(boost[page - 1])
      }
    } 
    for (let i = 0; i < post.length; i++) {
      if (like.includes(post[i]._id.toString()) ) {
        post[i].isLiked = true
      } 
    }
  }

  res.status(200).json({ success: true, data: post, pagination, })
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({path: 'createUser', select: 'lastName firstName profile'}).populate({path: 'sharePost', populate: {path: "createUser", select: "lastName firstName profile"}});

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }
  // Хандалт тоологч
  if (post.count == null) {
      // default data
      const beginCount = new Post({
          count : 1
      })
      beginCount.save()
  }
  else {
      post.count += 1;
      post.save()
  }
  const like = await Like.find({createUser: req.userId, post: req.params.id}).select('post')

  if (like != null ) {
    post.isLiked = true
  } else {
    post.isLiked = false
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

exports.boostPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const cv = await Cv.findById(req.userId);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  if(!req.body.boost) {
    throw new MyError(" Boost төрлөө сонгоно уу?", 400);
  }

  Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  if(cv.point < req.body.boost) {
    throw new MyError(" Point оноо хүрэхгүй байна", 400);
  } else {
    if(post.boost < Date.now() ) {
      const date = new Date()
        cv.point -= req.body.boost
        post.boost = date.addDays(req.body.boost) 
        post.isBoost = true
    } else {
        let date = post.boost
        cv.point -= req.body.boost
        post.boost = date.addDays(req.body.boost)
        post.isBoost = true
    }
  }
  const expire = setTimeout(() => {post.isBoost = false, post.save()}, Math.abs(Number(post.boost) - Date.now()))

  cv.save()
  post.save()

  res.status(200).json({
    success: true,
    data: post,
    cv: cv
  });
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  const postCat = await Cv.create(req.body);

  res.status(200).json({
    success: true,
    data: postCat,
  });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    throw new MyError("Body хоосон байж болохгүй", 400);
  }
  req.body.createUser = req.userId;
  const articl = await Post.create(req.body);
  const cv = await Cv.findById(req.userId);
  cv.postNumber += 1
  cv.save()

  
  // image upload
  // if (req.files != null) {
  //   const article = await Post.findById(articl._id);

  //   if (!article) {
  //     throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  //   }
  //   const file = req.files.file;
  //   if (!file.mimetype.startsWith("image")) {
  //     throw new MyError("Та зураг upload хийнэ үү.", 400);
  //   }
  
  //   if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
  //     throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  //   }
  
  //   file.name = `post_${req.userId}_${Date.now()}${path.parse(file.name).ext}`;
  
    
  //   const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  //     article.photo = file.name;
  //     article.save();
  
  //     res.status(200).json({
  //       success: true,
  //       article: article,
  //       data: file.name,
  //     });
    
  
    
  // } else {

  // }
  res.status(200).json({
    success: true,
    article: articl,
  });
});

// exports.createPost = asyncHandler(async (req, res, next) => {
//   const profile = await Cv.findById(req.userId);
//   req.body.createUser = req.userId;

//   const post = await Post.create(req.body);
//   profile.post.addToSet(post._id)
//   profile.save()
//   res.status(200).json({
//     success: true,
//     data: post,
//   });
// });

exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (
  //   post.createProfile.toString() !== req.userId &&
  //   req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  post.remove();

  res.status(200).json({
    success: true,
    data: post,
  });
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (
    post.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateProfile = req.userId;

  for (let attr in req.body) {
    post[attr] = req.body[attr];
  }

  post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// PUT:  api/v1/Posts/:id/photo
// exports.uploadPostPhoto = asyncHandler(async (req, res, next) => {
//   const post = await Post.findById(req.params.id);

//   if (!post) {
//     throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
//   }

//   // image upload
//   const file = req.files.file;
//   if (!file.mimetype.startsWith("image")) {
//     throw new MyError("Та зураг upload хийнэ үү.", 400);
//   }

//   if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
//     throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
//   }

//   file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;
  
//   const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
//     post.photo = file.name;
//     post.save();

//     res.status(200).json({
//       success: true,
//       data: file.name,
//       piture: picture
//     });
  
// });

exports.uploadPostPhoto = asyncHandler(async (req, res, next) => {
  const cv = await Post.findById(req.params.id);

  if (!cv) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `post_${req.params.id}${path.parse(file.name).ext}`;
  
  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
    cv.photo = file.name;
    cv.save();

    res.status(200).json({
      success: true,
      data: cv
    });
  
});
