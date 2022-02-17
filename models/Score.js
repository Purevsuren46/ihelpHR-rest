const mongoose = require("mongoose")
const ScoreSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cv',
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
    job: {
        type: mongoose.Schema.ObjectId,
        ref: 'Job',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}} )

ScoreSchema.statics.computeCvAveragePoint = async function (jobId, userId, canId, avePoint, id) {
    const obj = await this.aggregate([
        { $match: {job: jobId, createUser: userId, candidate: canId} },
        { $group: {_id: "$candidate", avgPoint: {$avg: "$point"}} }
    ])
    console.log(obj)
    await this.model('Score').findByIdAndUpdate(id, {
        avePoint: obj[0].avgPoint,

    })

    await this.model('Score').deleteMany({createUser: userId, job: jobId, candidate: canId, createdAt: {$lt: String(Date.now() - 1000)}}, {
        
    })
    const obje = await this.aggregate([
        { $match: {job: jobId, candidate: canId} },
        { $group: {_id: "$candidate", avgPoint: {$avg: "$avePoint"}} }
    ])
    console.log(obje)
    await this.model('Score').updateMany({job: jobId, candidate: canId}, {
        candAvg: obje[0].avgPoint,

    })
    return obj
}

ScoreSchema.post('save', function(){
    this.constructor.computeCvAveragePoint(this.job, this.createUser, this.candidate, this.avePoint, this._id)
});

ScoreSchema.pre('remove', function(){
    this.constructor.computeCvAveragePoint(this.job, this.createUser, this.candidate, this.avePoint, this.createdAt)
});


module.exports = mongoose.model("Score", ScoreSchema)