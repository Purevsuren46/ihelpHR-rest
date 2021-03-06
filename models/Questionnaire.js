const mongoose = require("mongoose");

const QuestionnareSchema = new mongoose.Schema({
  firstName: {
      type: String,
      default: null
  },
  lastName: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ["Эр", "Эм"]
  },
  birth: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  birthPlace: {
    type: String,
    default: null
  },
  phoneEmergency: {
    type: Number,
    default: null
  },
  humanId: {
    type: String,
    // match: [
    //     /([Ё-Ө]{2}[0-9]{8})/,
    //     "Регистэр буруу байна.",
    // ],
  },
  driverLicense: {
    type: Boolean,
    default: false
  },
  working: {
    type: Boolean,
    default: false,
  },
  workingCompany: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "null",
    enum: ["opentowork", "working", "getEmployee", "lookingForJob", "null"],
  },
  position: {
    type: String,
    enum: ["senior", "intern", "junior"],
  },
  profession: {
    type: String,
    default: null
  },
  register: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ["Мэргэжилтэн", "Дадлага", "Мэргэжил хамаарахгүй", "Дунд шатны удирдлага", "Дээд шатны удирдлага"],
  },
  family: [{
    who: {type: String, default: null},
    firstName: {type: String,    default: null},
    lastName: {type: String,    default: null},
    birthYear: {type: Number,    default: null},
    phone: {type: Number,    default: null},
    birthPlace: {type: String,    default: null},
    workingCompany: {type: String,    default: null},
    profession: {type: String,    default: null},
  }],
  salary: {
    type: String,
    enum: [
        "400,000 - 600,000", 
        "600,000 - 800,000", 
        "800,000 - 1,000,000", 
        "1,000,000 - 1,200,000", 
        "1,200,000 - 1,500,000", 
        "1,500,000 - 1,800,000", 
        "1,800,000 - 2,100,000", 
        "2,100,000 - 2,500,000", 
        "2,500,000 - 3,000,000", 
        "3,000,000 - 4,000,000", 
        "4,000,000 - 5,000,000", 
        "5,000,000 -аас дээш"]
},
  achievement: [
    {
      name: {type: String, default: null},
      year: {type: Number, default: null},
      company: {type: String, default: null}
    }
  ],
  skill: {
      advantage1: {type: String, default: null},
      advantage2: {type: String, default: null},
      advantage3: {type: String, default: null},
      advantage4: {type: String, default: null},
      disAdvantage1: {type: String, default: null},
      disAdvantage2: {type: String, default: null},
      disAdvantage3: {type: String, default: null},
      disAdvantage4: {type: String, default: null},
      health: {type: String, default: null}
    },
  experience: [{ 
    description: {
      type: String,
      maxlength: [500, "Категорийн тайлбарын урт 500 тэмдэгт байх ёстой."]
  },
  do: {
      type: String,
  },
  exitCause: {
      type: String,
  },
  achievements: {
      type: String,
  },
  contactInfo: {
      type: String,
  },
  start: {
      type: Date,
  },
  end: {
      type: Date,
  },
  isWorking: {
      type: Boolean,
  },
  company: {
      type: String,
  },
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: "Cv",
  },
  companyPhoto: {
    type: String,
    default: "cover_620f25f83f2cc51604fadfe0.jpg"
  },
  category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
  },
  occupation: {
      type: mongoose.Schema.ObjectId,
      ref: "Occupation",
  },
  position: {
      type: String,
  },
  location: {
      type: String,
  },
  type: {
      type: String,
      enum: ['Бүтэн цаг', 'Хагас цаг', 'freelancer', 'self-employed', 'contract', 'intern', 'apprentice', 'seasonal' ]
  },
  }],
  language: [{
    country: {
      type: String,
      default: null
    },
    level: {
      type: String,
      default: null
    }
  }],
  course: [{ 
  field: {
      type: String,
  default: null
  },
  school: {
      type: String,
      
  default: null
  },
  schoolId: {
    type: mongoose.Schema.ObjectId,
    ref: "Cv",
  },
  schoolPhoto: {
    type: String,
    default: "cover_620f25f83f2cc51604fadfe0.jpg"
  },
  location: {
    type: String,
  },
  grade: {
      type: String,
      
  default: null
  },
  isStudying: {
      type: Boolean,
      
  default: false
  },
  activity: {
      type: String,
      
  default: null
  },
  start: {
      type: Date,
      
  default: null
  },
  end: {
      type: Date,
      
  default: null
  },
  }],
  education: {
    type: String,
    enum: ["Бүрэн дунд", "Бакалавр", "Магистр", "Доктор"]
  },
  experiences: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    default: 0
  },  
  familyCount: {
    type: Number,
    default: 0
  }, 
  achievementCount: {
    type: Number,
    default: 0
  }, 
  experienceCount: {
    type: Number,
    default: 0
  }, 
  courseCount: {
    type: Number,
    default: 0
  }, 
  salaryExpectation: {
    type: String,
    default: null
  }, 
  profile: {
    type: String,
    default: "ihelp.jpg"
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cv',
  },
  experienceYear: {
    type: String,
    enum: [
        "Байхгүй", 
        "1", 
        "2-3", 
        "4-5", 
        "6-8", 
        "9-11", 
        "11-13", 
        "13-15", 
        "16+"
      ]
  },
  educationLevel: {
    type: String,
    enum: [
        "Доктор", 
        "Магистр", 
        "Бакалавр", 
        "Тусгай мэргэжлийн дунд", 
        "Бүрэн дунд", 
        "Суурь", 
        "Бага"
      ]
  },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}});



module.exports = mongoose.model("Questionnaire", QuestionnareSchema);