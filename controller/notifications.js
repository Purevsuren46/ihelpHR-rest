const Notification = require('../models/Notification')
const Cv = require('../models/Cv')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getNotifications = asyncHandler(async (req, res, next) => {
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 5;
const sort = req.query.sort;
const select = req.query.select;

["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

const pagination = await paginate(page, limit, Notification);
const user = await User.findById(req.userId)
const notifications = await Notification.find(req.query, select)
  .populate({
    path: "category",

    select: "name ",
  })
  .sort(sort)
  .skip(pagination.start - 1)
  .limit(limit);

  
// const count = notifications.length - User.readNotif.length

res.status(200).json({
  success: true,
  count: notifications.length - user.readNotif.length,
  data: notifications,
  pagination,
});
});
      
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
req.query.createUser = req.userId;
return this.getNotifications(req, res, next);
});
      
exports.getNotification = asyncHandler(async (req, res, next) => {
const notification = await Notification.findById(req.params.id);
const user = await User.findById(req.userId);
user.readNotif.addToSet(req.params.id);
user.save()
if (!notification) {
  throw new MyError(req.params.id + " ID-тэй ажил байхгүй байна.", 404);
}
console.log(user.readNotif.length)
res.status(200).json({
  success: true,
  data: notification,
  
});
});

exports.createNotification = asyncHandler(async (req, res, next) => {
console.log("data: ", req.body)
const occupation = await Notification.create(req.body)
res.status(200).json({ success: true, data: occupation, })
    
    
})

exports.updateNotification = asyncHandler(async (req, res, next) => {
    
const occupation = await Notification.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
})
if(!occupation) {
return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
} 
res.status(200).json({ success: true, data: occupation, })   
})

exports.deleteNotification = asyncHandler(async (req, res, next) => {
const occupation = await Notification.findById(req.params.id)
if(!occupation) {
return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
} 
occupation.remove()
res.status(200).json({ success: true, data: occupation, })
        
})