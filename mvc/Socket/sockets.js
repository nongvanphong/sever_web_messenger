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
    const token = socket.handshake.auth.token;

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
    // lặp đẻ lấy ra các thông tyin ở trong soket
    // io.sockets.sockets.forEach((socket) => {
    //   connections.push({
    //     iduser: socket.id,
    //   });
    // });
    // for (let [id, socket] of io.of("/").sockets) {
    //   console.log(id, socket.iduser);
    //   if (socket.iduser) {
    //     connections.push({
    //       idsoket: id,
    //       iduser: socket.iduser,
    //     });
    //   }
    // }
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
  // thông boa khi có người nhắn tin
  socket.broadcast.emit("notify private massage", {
    userID: socket.id,
  });

  // nhận giữ liệu từ người nhận
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });
};
