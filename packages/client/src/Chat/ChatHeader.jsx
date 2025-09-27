import { useState } from "react";

import { IoMdExit } from "react-icons/io";
import { IoTrashBinOutline } from "react-icons/io5";

import { useAuth } from "../Authentication/AuthProvider";

import DeleteRoomPopUp from "../Components/PopUps/DeleteRoom";
import LeaveRoomPopUp from "../Components/PopUps/LeaveRoom";

function ChatHeader({ roomName, roomId, roomOwner, leaveRoom, deleteRoom }) {

  const { authUser } = useAuth();

  const [copied, setCopied] = useState(false);

  const [leaveButton, setLeaveButton] = useState(false);

  const [deleteButton, setDeleteButton] = useState(false);

  const openLeavePopUp = () => {
    setLeaveButton(!leaveButton);
  }

  const closeLeavePopUp = () => {
    setLeaveButton(false);
  }

  const openDeletePopUp = () => {
    setDeleteButton(!deleteButton);
  }

  const closeDeletePopUp = () => {
    setDeleteButton(false);
  }

  return (
    <div className="border-b flex flex-col items-center gap-4 py-2">
      <h2>
        <strong>Name: </strong>{roomName}
      </h2>
      <h2>
        <strong>
          Room ID:&nbsp;
        </strong>
        {roomId.toUpperCase()}
        {copied ?
          (
            <p className="inline ml-2 px-5 py-3 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition text-white font-medium text-sm">
              ✅ Copied
            </p>
          ) :
          (
            <button
              className="ml-2 px-5 py-3 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition text-white font-medium text-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(roomId.toUpperCase());
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000)
                } catch (err) {
                  console.error(err);
                }
              }}>

              Copy
            </button>
          )}
      </h2>
      {authUser.id === roomOwner ? (
        <div className="w-full flex items-center justify-center gap-1">
          Delete Room
          <button
            onClick={openDeletePopUp}>
            <IoTrashBinOutline size={30} color="red" />
          </button>
          {deleteButton && <DeleteRoomPopUp onClose={closeDeletePopUp} roomId={roomId} deleteRoom={deleteRoom} />}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center gap-1">
          Leave Room
          <button
            onClick={openLeavePopUp}>
            <IoMdExit size={30} color="red" />
          </button>
          {leaveButton && <LeaveRoomPopUp onClose={closeLeavePopUp} roomId={roomId} leaveRoom={leaveRoom} />}
        </div>
      )}
    </div>
  )
}

export default ChatHeader;