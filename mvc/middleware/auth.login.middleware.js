const jwt = require("jsonwebtoken");
// khái báo để lấy biến ở bên .env
const dotenv = require("dotenv").config({ path: "process.env" });
const KEY1 = dotenv.parsed.TOKENKEY1;
const KEY2 = dotenv.parsed.TOKENKEY2;

// check email
const jwtveryfy = (req, res, next) => {
  // lấy token từ header ra
  const cookieHeader = req.headers.cookie;

  // nếu gửi bằng headre thì cooke sẽ có dạng chuối
  // Chuyển đổi chuỗi cookie thành đối tượng JSON
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const value = parts[1];
    cookies[name] = value;
  });
  const token = cookies.cookieAcceptToken;
  const refreshToken = cookies.cookieRefreshToken;
  //const authheader = req.header("Authorization");
  // console.log(authheader);
  // lấy token ra và kiểm tra authheader có thì chúng ta sẽ cắt chuỗi
  //const token = authheader && authheader.split(" ")[1];

  // nếu không có toke thì sẽ bão lỗi
  if (!token) {
    return res.status(401).send({ message: "token sai hoạc không tồn tại" });
  }

  // trả ra token

  try {
    const decoded = jwt.verify(token, KEY1);
    req.iduser = decoded.id;
    next();
  } catch (error) {
    //  res.status(403).send({ message: "không dịch được toek, token đã hết hạn" });
    const update = updateToke(refreshToken);

    if (update == 403) {
      return res
        .status(403)
        .send({ message: "không dịch được toek, token đã hết hạn" });
    } else {
      return res.status(201).json({ acceptToken: update });
    }
  }
};

// viết hàm tạo updateToke khi hết hạn
const updateToke = (refeshtoken) => {
  if (!refeshtoken) {
    return res
      .status(401)
      .send({ message: "refreshtoken sai hoạc không tồn tại" });
  }
  try {
    const decoded = jwt.verify(refeshtoken, KEY2);
    // req.iduser = decoded.id;
    const id = decoded.id;

    // cấp lại token
    const acceptToken = jwt.sign({ id }, KEY1, {
      expiresIn: "1h",
    });

    return acceptToken;
  } catch (error) {
    return 403;
  }
};
module.exports = {
  jwtveryfy,
};
