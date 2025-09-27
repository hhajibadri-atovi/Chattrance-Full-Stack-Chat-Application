import { useState } from "react";

import { API_ROUTES } from "chattrance-shared";

import "./DeleteRoom.css";

const DeleteRoomPopUp = ({ onClose, roomId, deleteRoom }) => {

  const [message, setMessage] = useState("");

  const handleDeleteRoom = async () => {
    const res = await fetch(`${API_ROUTES.CHAT.DELETE_ROOMS}/?room-id=${roomId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const serverData = await res.json();
    console.log(serverData);
    if (serverData.ok) {
      onClose();
      deleteRoom(roomId);
    } else {
      setMessage(serverData.error);
    }
  }

  return (
    <div className="popup-container">
      <div className="relative popup">

        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-2xm rounded-tr-md rounded-bl-sm bg-gradient-to-r from-red-500 to-red-300 to-100% hover:from-purple-500 hover:to-yellow-500 text-white">
          Close
        </button>

        <div className="mt-8 flex flex-col items-center gap-3">

          <span>Select <strong>Delete</strong> to delete current room or <strong>Close</strong> to exit</span>

          <div className=" flex gap-8 justify-between">
            <button
              onClick={handleDeleteRoom}
              className="px-10 py-2 text-2xm rounded-md bg-gradient-to-r from-green-500 to-green-400 to-100% hover:from-purple-500 hover:to-yellow-500 text-white">
              Delete
            </button>

          </div>


          <p className="text-red-600 font-semibold">
            {message ? message : null}
          </p>
        </div>
      </div>
    </div>
  )

}

export default DeleteRoomPopUp;