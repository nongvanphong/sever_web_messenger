const pool = require("../../config");
const cratedate = require("../modules/createdate.modules");

searUserChat = (textsearch, callback) => {
  const searchTerm = "%" + textsearch + "%";
  pool.query(
    "select u.idusers, u.users_name, u.img from users as u where u.users_condistion !=1 and u.users_name like ?",
    [searchTerm],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};

// lấy danh sách  những người mà bạn đang nhăn tin
getListDataUserChat = (myid, callback) => {
  pool.query(
    "SELECT c.idconversations, u1.idusers AS iduser1, u1.users_name AS name1, u1.img AS img1,u2.idusers AS iduser2, u2.users_name AS name2, u2.img AS img2, m.timesend, m.msgtext,(SELECT SUM(CASE WHEN m.condistions = 1 THEN 1 ELSE 0 END) FROM messangers as m where m.condistions=1 and m.idconversations=c.idconversations) as notify FROM conversations AS c JOIN users AS u1 ON c.idusersend = u1.idusers JOIN users AS u2 ON c.iduserget = u2.idusers JOIN messangers AS m ON c.idconversations = m.idconversations JOIN (   SELECT idconversations, MAX(timesend) AS latest_timestamp FROM messangers  GROUP BY idconversations  ) AS latest_message ON m.idconversations = latest_message.idconversations AND m.timesend = latest_message.latest_timestamp  WHERE (c.idusersend = ? OR c.iduserget = ?);",
    [myid, myid],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};

// lấy nội dkung chat
getPritaveMessenger = (myid, idrsend, callback) => {
  pool.query(
    "select m.idmessangers, c.idconversations,  m.idusersend,m.iduserget,m.msgtext,m.timesend  from  conversations as c left join messangers as m  on m.idconversations=c.idconversations where (m.idusersend=? or m.iduserget=?) and   (m.idusersend=? or m.iduserget=?)",
    [myid, myid, idrsend, idrsend],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};

// kiểm tra 2 người dùng đã chat với nhau chưa

checkChatPrivate = (myid, idreceiver, callback) => {
  pool.query(
    " select idconversations from conversations   where (idusersend=? or iduserget=?) and (idusersend=? or iduserget=?) limit 1;",
    [myid, myid, idreceiver, idreceiver],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};
//tạo id conversation
creatIdconversation = (myid, idreceiver, callback) => {
  pool.query(
    "INSERT INTO `conversations` (`idusersend`, `iduserget`) SELECT ?, ? WHERE NOT EXISTS ( SELECT * FROM `conversations` WHERE (`idusersend` = ? or `idusersend` = ?) AND (`iduserget` = ? or `iduserget` = ?)  );",
    [myid, idreceiver, myid, idreceiver, myid, idreceiver],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};

// tạo tin nhắn
creatChatPrivate = (myid, idreceiver, content, idconversation, callback) => {
  pool.query(
    "INSERT INTO `messangers` ( `idusersend`,  `msgtext`, `timesend`, `idconversations`,`iduserget`) VALUES ( ?,  ?, ?, ?,?);",
    [myid, content, cratedate.createDate(), idconversation, idreceiver],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};
// tạo danh sách chat
insertListChat = (myid, idsend, callback) => {
  pool.query(
    "INSERT INTO `conversations` (`idusersend`, `iduserget` )  VALUES (?, ?);",
    [myid, idsend],
    (err, results) => {
      if (err) return callback(500);

      callback(results);
    }
  );
};

module.exports = {
  searUserChat,
  getListDataUserChat,
  getPritaveMessenger,
  checkChatPrivate,
  creatIdconversation,
  creatChatPrivate,
};
