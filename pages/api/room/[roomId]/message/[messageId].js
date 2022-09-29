import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;

  if (req.method === "DELETE") {
    //check token

    const user = checkToken(req);
    const rooms = readChatRoomsDB();
    if (!user)
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });

    const Idx = rooms.findIndex((x) => x.roomId === roomId);
    //check if roomId exist
    if (Idx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    }
    //check if messageId exist
    const Idxmessage = rooms[Idx].messages.findIndex(
      (x) => x.messageId === messageId
    );
    if (Idxmessage === -1) {
      return res.status(404).json({ ok: false, message: "Invalid message id" });
    }
    //check if token owner is admin, they can delete any message
    if (user.isAdmin === true) {
      rooms[Idx].message.splice(Idxmessage, 1);
      writeChatRoomsDB(rooms);
      return res.status(200).json({ ok: true });
    }
    //or if token owner is normal user, they can only delete their own message!
    if (user.isAdmin === false) {
      if (rooms[Idx].messages[Idxmessage].username === user.username) {
        rooms[Idx].message.splice(Idxmessage, 1);
        writeChatRoomsDB(rooms);
        return res.status(200).json({ ok: true });
      } else {
        return res.status(403).json({
          ok: false,
          message: "You do not have permission to access this data",
        });
      }
    }
  }
}
