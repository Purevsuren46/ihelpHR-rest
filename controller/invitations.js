const Invitation = require('../models/Invitation')
const MyError = require("../utils/myError")
const asyncHandler = require("express-async-handler")
const paginate = require("../utils/paginate")

exports.getInvitations = asyncHandler(async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sort = req.query.sort;
        const select = req.query.select;

        ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

        // Pagination
        const pagination = await paginate(page, limit, Invitation)

        const invitations = await Invitation.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate({path: "createUser", select: "name lastName firstName profile"})

        res.status(200).json({ success: true, data: invitations, pagination, })
    
})

exports.getInvitation = asyncHandler( async (req, res, next) => {
    
        const invitation = await Invitation.findById(req.params.id).populate({path: "createUser", select: "name lastName firstName profile"})
        
        if(!invitation) {
        throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400)
        } 
        res.status(200).json({ success: true, data: invitation})
    
})

exports.getCvInvitations = asyncHandler(async (req, res, next) => {
        req.query.candidate = req.params.id;
        return this.getInvitations(req, res, next);
});

exports.createInvitation = asyncHandler(async (req, res, next) => {
    req.body.createUser = req.userId
    req.body.candidate = req.params.id
    
    const category = await Invitation.create(req.body)
    
    res.status(200).json({ success: true, data: category, })
        
        
    })

exports.deleteInvitation = asyncHandler(async (req, res, next) => {
        const invitation = await Invitation.findById(req.params.id)

        if(!invitation) {
        return res.status(400).json({ success: false, error: req.params.id + " ID-тай ажил байхгүй.", })
        } 
        invitation.remove()
        res.status(200).json({ success: true, data: invitation, })
        
})