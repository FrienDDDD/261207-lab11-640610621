import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../backendLibs/dbLib";
import { v4 as uuidv4 } from "uuid";
import { checkToken } from "../../../../backendLibs/checkToken";

export default function roomIdMessageRoute(req, res) {
  if (req.method === "GET") {
    //check token
    const user = checkToken(req);
    if (!user)
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });

    //get roomId from url
    const roomId = req.query.roomId;

    const rooms = readChatRoomsDB();
    //check if roomId exist
    const Idx = rooms.findIndex((x) => x.roomId === roomId);
    //find room and return
    //...
    if (Idx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    } else {
      return res.json({ ok: true, messages: rooms[Idx].messages });
    }
  } else if (req.method === "POST") {
    //check token
    const user = checkToken(req);
    if (!user)
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });

    //get roomId from url
    const roomId = req.query.roomId;
    const rooms = readChatRoomsDB();
    const Idx = rooms.findIndex((x) => x.roomId === roomId);

    if (Idx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    }

    //validate body
    if (typeof req.body.text !== "string" || req.body.text.length === 0)
      return res.status(400).json({ ok: false, message: "Invalid text input" });

    //create message
    const message = {
      messageId: uuidv4(),
      text: req.body.text,
      username: user.username,
    };
    rooms[Idx].messages.push(message);
    writeChatRoomsDB(rooms);
    return res.json({ ok: true, message });
  }
}
