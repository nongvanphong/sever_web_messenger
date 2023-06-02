const model = require("../models/messenger.models");
var validator = require("../../validate");
const auth = require("../middleware/auth.login.middleware");

module.exports = (app) => {
  app.post("/search-messenger-users", (req, res) => {
    const { search } = req.body;

    model.searUserChat(search, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");

      res.status(200).json(results);
    });
  });
  app.post("/get-list-data-user-messenger", (req, res) => {
    const { myid } = req.body;

    model.getListDataUserChat(myid, function (results) {
      if (results === 500)
        return res.status(500).send("máy chử không truy cập được");

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
