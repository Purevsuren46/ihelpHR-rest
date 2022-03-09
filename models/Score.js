const mongoose = require("mongoose")
const ScoreSchema = new mongoose.Schema({
    apply: {
        type: mongoose.Schema.ObjectId,
        ref: 'Apply',
    },
    point: {
        type: Number,
    },
    avePoint: {
        type: Number,
    },
    candAvg: {
        type: Number,
    },
    createUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}} )

ScoreSchema.statics.computeCvAveragePoint = async function (applyId, userId, canId, avePoint, id) {
    const obj = await this.aggregate([
        { $match: {apply: applyId, createUser: userId} },
        { $group: {_id: "$apply", avgPoint: {$avg: "$point"}} }
    ])
    await this.model('Score').findByIdAndUpdate(id, {
        avePoint: obj[0].avgPoint,

    })

    await this.model('Score').deleteMany({createUser: userId, apply: applyId, createdAt: {$lt: String(Date.now() - 1000)}}, {
        
    })
    const obje = await this.aggregate([
        { $match: {apply: applyId} },
        { $group: {_id: "$apply", avgPoint: {$avg: "$avePoint"}} }
    ])
    await this.model('Score').updateMany({apply: applyId}, {
        candAvg: obje[0].avgPoint,

    })
    return obj
}

ScoreSchema.post('save', function(){
    this.constructor.computeCvAveragePoint(this.apply, this.createUser, this.candidate, this.avePoint, this._id)
});

ScoreSchema.pre('remove', function(){
    this.constructor.computeCvAveragePoint(this.apply, this.createUser, this.candidate, this.avePoint, this.createdAt)
});


module.exports = mongoose.model("Score", ScoreSchema)