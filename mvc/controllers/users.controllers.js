const model = require("../models/users.models");
const jwt = require("jsonwebtoken");
const validate = require("../../validate");
const mdw = require("../middleware/user.middleware");
const up = require("../middleware/upload.middeleware");

const auth = require("../middleware/auth.login.middleware");
// khái báo để lấy biến ở bên .env
const dotenv = require("dotenv").config({ path: "process.env" });
const key1 = dotenv.parsed.TOKENKEY1;
const key2 = dotenv.parsed.TOKENKEY2;

// Đăng nhập thành công, tạo mã token cho user
// hạm tạo token và refeshtoek const generateToken = (payload) => {
const generateToken = (payload) => {
  const id = payload;
  const acceptToken = jwt.sign({ id }, key1, {
    expiresIn: "5h",
  });
  // tạo thêm 1 resfeshtoke
  const refreshToken = jwt.sign({ id }, key2, {
    expiresIn: "5h",
  });

  return { acceptToken, refreshToken, id };
};

// viết hàm tạo resfeshtoke khi hết hạn
const updateRefeshToke = (username, refeshtoken) => {
  users = datauser.map((user) => {
    if (user.name === username) {
      // lấy ra toàn bô giá trị của user và chỉ update resfeshtoke

      return (user.refeshtoken = refeshtoken);
    }
    return user;
  });
};

module.exports = (app) => {
  app.post("/login", mdw.checkAccLogin, async (req, res) => {
    const iduser = req.iduser;
    const premission = req.premission;

    //res.status(200).send({ iduser: iduser, premission: premission });

    const tokens = generateToken(iduser);

    await model.createtoken(
      iduser,
      tokens.acceptToken,
      tokens.refreshToken,
      function (results) {
        if (results === 500) {
          return res.status(500).send("lỗi truy vẫn");
        }
        res.status(200).json(tokens);
      }
    );
  });

  app.post("/logout", auth.jwtveryfy, async (req, res) => {
    const id = req.iduser;
    console.log("000", id);

    await model.logouttoken(id, function (results) {
      if (results === 500) {
        return res.status(500).send("lỗi truy vẫn");
      }
      res.status(200).send("đăng xuất thành công");
    });
  });

  app.post("/getinformationuser", auth.jwtveryfy, async (req, res) => {
    const iduser = req.iduser;

    await model.getInformationusUser(
      iduser,

      function (results) {
        if (results === 500) return res.status(500).send("Lỗi server");
        results[0].users_premission = results[0].users_premission[0];
        results[0].img =
          "http://" +
          dotenv.parsed.HOST +
          ":" +
          dotenv.parsed.PORT +
          "/" +
          dotenv.parsed.PARTIMG +
          "/" +
          results[0].img;
        return res.status(200).json(results);
      }
    );
  });

  app.post("/fillupinformation", up.handleImageUpload, async (req, res) => {
    const iduser = req.iduser;
    const username = req.username;
    const image = req.img;

    await model.fillupinformation(iduser, username, image, function (results) {
      if (results === 500)
        return res.status(500).send({ message: "lỗi truy vẫn" });
      return res.status(200).send("success");
    });
  });
  app.post(
    "/registeruser",
    mdw.validateDataSigister,
    mdw.checkEmail,
    async (req, res) => {
      // nếu mà thành công thì cho phép đăng kí
      model.registerUser(req.email, req.password, function (results) {
        //  console.log("==== > ", Buffer.isBuffer(results.users_condistion));
        if (results === 500)
          return res.status(500).send({ message: "Đăng kí thất bại" });
        res.status(200).send({ message: "Đăng kí thành công" });
      });
    }
  );
  app.post("/t", auth.jwtveryfy, (req, res) => {
    console.log("honaf thanh");
  });
};
