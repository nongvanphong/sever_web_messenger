const socketIO = require("socket.io");
// Lưu trữ thông tin kết nối và người dùng
let connections = [];
const jwt = require("jsonwebtoken");
// khái báo để lấy biến ở bên .env
const dotenv = require("dotenv").config({ path: "process.env" });
const KEY1 = dotenv.parsed.TOKENKEY1;
const KEY2 = dotenv.parsed.TOKENKEY2;
module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000", // Thay đổi thành URL của client ReactJS của bạn
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  // giải mã token

  // check token
  const jwtveryfy = (token) => {
    // nếu không có toke thì sẽ bão lỗi
    if (!token) {
      return 401;
    }

    // trả ra token

    try {
      const decoded = jwt.verify(token, KEY1);
      return decoded;
    } catch (error) {
      return 403;
    }
  };

  // đây là midlleware nếu không thành công thì người dùng không thể ra khỏ hàm này
  io.use((socket, next) => {
    let token;

    if (socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    } else {
      token = socket.handshake.headers.auth;
    }

    const results = jwtveryfy(token);

    if (results == 403 || results == 401) {
      console.log("không thể truye cập");
      return next(new Error("token bị lõi"));
    }
    socket.iduser = results.id;
    next();
  });
  // mang chưa danh sách user

  io.on("connection", (socket) => {
    connections.push({
      idsoket: socket.id,
      iduser: socket.iduser,
    });
    //gửi thông tin các user về
    socket.emit("users", connections);
    console.log("số lượng người đang online", connections.length);
    // nhắn tin nhắn riêng
    chatPrivate(socket, io);
    socket.on("disconnect", () => {
      connections = connections.filter((item) => item.idsoket !== socket.id);
      console.log("số lượng người đang online", connections.length);
    });
  });
};

const chatPrivate = (socket, io) => {
  // nhận giữ liệu từ người nhận
  socket.on("private message", ({ content, to }) => {
    const idreceiver = connections.find((i) => i.iduser == to);
    try {
      // thông boa khi có người nhắn tin
      socket.to(idreceiver.idsoket).emit("notify private massage", {
        content,
        from: socket.iduser,
      });
      socket.to(idreceiver.idsoket).emit("private message", {
        content,
        from: socket.id,
      });
    } catch (error) {
      console.error("người dũng đã offline");
    }
  });
};
