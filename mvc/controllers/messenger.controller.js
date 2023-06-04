const model = require("../models/messenger.models");
var validator = require("../../validate");
const auth = require("../middleware/auth.login.middleware");
const dotenv = require("dotenv").config({ path: "process.env" });
module.exports = (app) => {
  app.post("/search-messenger-users", (req, res) => {
    const { search } = req.body;

    model.searUserChat(search, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");
      // Lặp qua mảng và thực hiện các thay đổi
      for (let i = 0; i < results.length; i++) {
        if (results[i].img) {
          results[i].img =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/" +
            results[i].img;
        } else {
          results[i].img =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/null.png";
        }
      }
      res.status(200).json(results);
    });
  });
  app.post("/get-list-data-user-messenger", (req, res) => {
    const { myid } = req.body;

    model.getListDataUserChat(myid, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");

      // Lặp qua mảng và thực hiện các thay đổi
      for (let i = 0; i < results.length; i++) {
        if (results[i].img1) {
          results[i].img1 =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/" +
            results[i].img1;
        } else {
          results[i].img1 =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/null.png";
        }

        if (results[i].img2) {
          results[i].img2 =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/" +
            results[i].img2;
        } else {
          results[i].img2 =
            "http://" +
            dotenv.parsed.HOST +
            ":" +
            dotenv.parsed.PORT +
            "/" +
            dotenv.parsed.PARTIMG +
            "/null.png";
        }
      }

      // Xuất kết quả

      res.status(200).json(results);
    });
  });
  app.post("/private-messenge", (req, res) => {
    const { myid, idsend } = req.body;

    model.getPritaveMessenger(myid, idsend, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");

      res.status(200).json(results);
    });
  });

  // kiểm tra xem 2 người đã nhắn tin với nhau chưa
  app.post("/create-messenge-private", (req, res) => {
    const { myid, idreceiver } = req.body;
    model.creatIdconversation(myid, idreceiver, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");

      model.checkChatPrivate(myid, idreceiver, function (results) {
        if (results === 500)
          return res.status(500).send("máy chử không truy cập được");

        try {
          return res.status(200).json(results[0].idconversations);
        } catch (error) {
          return res.status(200).send("-1");
        }
      });
    });
  });

  // hàm insert tin nhắn vào sql
  app.post("/insert-private-messenge", (req, res) => {
    const { myid, idreceiver, content, idconversation } = req.body;

    model.creatChatPrivate(
      myid,
      idreceiver,
      content,
      idconversation,
      function (results) {
        if (results === 500)
          return res.status(500).send("máy chử không truy cập được");

        return res.status(200).send("ok");
      }
    );
  });
};
