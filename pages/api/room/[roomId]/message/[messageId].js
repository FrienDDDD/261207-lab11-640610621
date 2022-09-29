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
    if (!user)
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });

    const rooms = readChatRoomsDB();

    //check if roomId exist
    const RoomIdx = rooms.findIndex((x) => x.roomId === roomId);
    if (RoomIdx === -1)
      return res.status(404).json({ ok: false, message: "Invalid room id" });

    //check if messageId exist

    const Idxmessage = rooms[RoomIdx].messages.findIndex(
      (x) => x.messageId === messageId
    );
    if (Idxmessage === -1)
      return res.status(404).json({ ok: false, message: "Invalid message id" });

    //check if token owner is admin, they can delete any message
    if (user.isAdmin === true) {
      rooms[RoomIdx].messages.splice(Idxmessage, 1);
      writeChatRoomsDB(rooms);
      return res.json({ ok: true });
    }
    //or if token owner is normal user, they can only delete their own message!
    if (
      user.isAdmin === false &&
      user.username === rooms[RoomIdx].messages[Idxmessage].username
    ) {
      rooms[RoomIdx].messages.splice(Idxmessage, 1);
      writeChatRoomsDB(rooms);
      return res.json({ ok: true });
    } else {
      return res.status(403).json({
        ok: false,
        message: "You do not have permission to access this data",
      });
    }
  }
}
