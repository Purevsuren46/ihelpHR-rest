const express = require("express");
const dotenv = require("dotenv");
var path = require("path");
var rfs = require("rotating-file-stream");
const colors = require("colors");
var morgan = require("morgan");
const logger = require("./middleware/logger");
const fileupload = require("express-fileupload");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

// Router оруулж ирэх
const profilesRoutes = require("./routes/profiles");
const invitationsRoutes = require("./routes/invitations");
const cvsRoutes = require("./routes/cvs");
const historiesRoutes = require("./routes/histories");
const jobsRoutes = require("./routes/jobs");
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const schoolsRoutes = require("./routes/schools");
const sharesRoutes = require("./routes/shares");
const likesRoutes = require("./routes/likes");
const followsRoutes = require("./routes/follows");
const questionnairesRoutes = require("./routes/questionnaires");
const announcementsRoutes = require("./routes/announcements");
const categoriesRoutes = require("./routes/categories");
const occupationsRoutes = require("./routes/occupations");
const transactionsRoutes = require("./routes/transactions");
const notificationsRoutes = require("./routes/notifications");
const scoresRoutes = require("./routes/scores");
const appliesRoutes = require("./routes/applies");
const walletsRoutes = require("./routes/wallets");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });

// Express апп үүсгэх
const app = express();

// MongoDB өгөгдлийн сантай холбогдох
connectDB();

// Манай рест апиг дуудах эрхтэй сайтуудын жагсаалт :
var whitelist = [
  "http://localhost:3000",
  "http://localhost:3005",
  "http://www.ihelp.mn",
  "http://ihelp.mn",
  "https://www.ihelp.mn",
  "https://ihelp.mn",
  "http://207.174.212.161.mn",
  "https://207.174.212.161.mn",
];

// Өөр домэйн дээр байрлах клиент вэб аппуудаас шаардах шаардлагуудыг энд тодорхойлно
var corsOptions = {
  // Ямар ямар домэйнээс манай рест апиг дуудаж болохыг заана
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      // Энэ домэйнээс манай рест рүү хандахыг зөвшөөрнө
      callback(null, true);
    } else {
      // Энэ домэйнд хандахыг хориглоно.
      callback(new Error("Horigloj baina.."));
    }
  },
  // Клиент талаас эдгээр http header-үүдийг бичиж илгээхийг зөвшөөрнө
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  // Клиент талаас эдгээр мэссэжүүдийг илгээхийг зөвөөрнө
  methods: "GET, POST, PUT, DELETE",
  // Клиент тал authorization юмуу cookie мэдээллүүдээ илгээхийг зөвшөөрнө
  credentials: true,
};
// index.html-ийг public хавтас дотроос ол гэсэн тохиргоо
app.use(express.static(path.join(__dirname, "public")));
// Express rate limit : Дуудалтын тоог хязгаарлана
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  message: "15 минутанд 3 удаа л хандаж болно! ",
});
app.use(limiter);
// http parameter pollution халдлагын эсрэг books?name=aaa&name=bbb  ---> name="bbb"
app.use(hpp());
// Cookie байвал req.cookie рүү оруулж өгнө0
app.use(cookieParser());
// Бидний бичсэн логгер
app.use(logger);
// Body дахь өгөгдлийг Json болгож өгнө
app.use(express.json());
// Өөр өөр домэйнтэй вэб аппуудад хандах боломж өгнө
app.use(cors(corsOptions));
// Клиент вэб аппуудыг мөрдөх ёстой нууцлал хамгаалалтыг http header ашиглан зааж өгнө
app.use(helmet());
// клиент сайтаас ирэх Cross site scripting халдлагаас хамгаална
app.use(xss());
// Клиент сайтаас дамжуулж буй MongoDB өгөгдлүүдийг халдлагаас цэвэрлэнэ
app.use(mongoSanitize());
// Сэрвэр рүү upload хийсэн файлтай ажиллана
app.use(fileupload());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Morgan logger-ийн тохиргоо
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

// REST API RESOURSE

app.use("/api/v1/profiles", profilesRoutes);
app.use("/api/v1/invitations", invitationsRoutes);
app.use("/api/v1/cvs", cvsRoutes);
app.use("/api/v1/histories", historiesRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use("/api/v1/shares", sharesRoutes);
app.use("/api/v1/likes", likesRoutes);
app.use("/api/v1/follows", followsRoutes);
app.use("/api/v1/questionnaires", questionnairesRoutes);
app.use("/api/v1/announcements", announcementsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/occupations", occupationsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/scores", scoresRoutes);
app.use("/api/v1/applies", appliesRoutes);
app.use("/api/v1/wallets", walletsRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use("/api/v1/schools", schoolsRoutes);

// Алдаа үүсэхэд барьж авч алдааны мэдээллийг клиент тал руу автоматаар мэдээлнэ
app.use(errorHandler);

// express сэрвэрийг асаана.
const server = app.listen(
  process.env.PORT,
  console.log(`Express сэрвэр ${process.env.PORT} порт дээр аслаа... `.rainbow)
);

// Баригдалгүй цацагдсан бүх алдаануудыг энд барьж авна
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`.underline.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
