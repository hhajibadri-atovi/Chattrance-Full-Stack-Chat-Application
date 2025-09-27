import { useEffect, useState } from "react";

import { IoPerson } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import { TbArrowsJoin } from "react-icons/tb";

import { API_ROUTES } from "chattrance-shared";

import ChatHeader from "./ChatHeader";
import ChatRoom from "./ChatRoom";

import NavBar from "../Components/NavBar";

import CreateRoomPopUp from "../Components/PopUps/CreateRoom";
import JoinRoomPopUp from "../Components/PopUps/JoinRoom";

function Chat() {

  const [chatRooms, setChatRooms] = useState([]);

  const [createButton, setCreateButton] = useState(false);

  const [currentRoomId, setCurrentRoomId] = useState(null);

  const [joinButton, setJoinButton] = useState(false);

  const currentRoom = chatRooms.find(room => room.id === currentRoomId);

  useEffect(() => {

    const fetchRooms = async () => {
      const rooms = await getRooms();
      setChatRooms(rooms);
    }
    fetchRooms();

  }, []);

  const addRoom = (room) => {
    setChatRooms(prev => [...prev, room]);
  };

  const leaveRoom = (roomId) => {
    setChatRooms(prev => prev.filter(r => r.id !== roomId));
    setCurrentRoomId(null);
  }

  const deleteRoom = (roomId) => {
    setChatRooms(prev => prev.filter(r => r.id !== roomId));
    setCurrentRoomId(null);
  }

  async function getRooms() {
    try {
      const res = await fetch(API_ROUTES.CHAT.GET_ROOMS, {
        credentials: "include"
      });
      const serverJSON = await res.json();
      if (serverJSON.ok) {
        return serverJSON.data.rooms;
      } else {
        setError(serverJSON.error);
        return [];
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  const handleRoomClick = (roomId) => {
    if (roomId !== currentRoomId) {
      setCurrentRoomId(roomId);
    }
  };

  const openCreatePopUp = () => {
    setCreateButton(!createButton);
  };

  const closeCreatePopUp = () => {
    setCreateButton(false);
  }

  const openJoinPopUp = () => {
    setJoinButton(!joinButton);
  }

  const closeJoinPopUp = () => {
    setJoinButton(false);
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">

      {/* Header and Navigation Bar */}
      <NavBar />

      {/* Lists all chat rooms you are active in */}
      <div className="flex flex-1 overflow-auto">
        <aside className="hidden md:flex md:w-64 flex-col border-r border-white/10">
          <div className="flex flex-col gap-2 px-4 py-3 border-b border-white/10">
            <h2 className="text-center text-lg font-semibold">Chat Rooms</h2>

            <div className="flex justify-center items-center">
              <p className="mr-2">Create a room</p>
              <button onClick={openCreatePopUp}>
                <CiCirclePlus size={30} color="skyblue" />
              </button>
              {createButton && <CreateRoomPopUp onClose={closeCreatePopUp} addRoom={addRoom} />}
            </div>

            <div className="flex justify-center items-center">
              <p className="mr-2">Join a room</p>
              <button onClick={openJoinPopUp}>
                <TbArrowsJoin size={30} color="skyblue" />
              </button>
              {joinButton && <JoinRoomPopUp onClose={closeJoinPopUp} />}
            </div>

          </div>
          <ul className="flex-1 overflow-auto">
            {chatRooms.length === 0 ? (
              <li className="text-center px-4 py-3 text-white/60">No chat rooms yet</li>
            ) : (
              chatRooms.map(room => (
                <div
                  key={room.id}
                  className="flex flex-col items-center justify-center px-4 py-3 hover:bg-gray-500 focus:bg-gray-800 w-full focus:outline-none focus:border-2 focus:border-blue-500 gap-3">
                  <button
                    onClick={() => { handleRoomClick(room.id) }}
                    className="flex flex-col items-center justify-center gap-3">
                    {room.name ? (
                      <span className="p-1 border-2">{room.name}</span>
                    ) : <span className="p-1 border-2">{room.id.toUpperCase()}</span>}

                    <div className="p-1 border-2 flex items-center justify-center">
                      <span className="text-xl mr-2">
                        {room.members.length + 1}
                      </span>
                      <IoPerson size={24} />
                    </div>
                  </button>

                </div>
              ))
            )}
          </ul>
        </aside>

        <section className="w-full flex flex-col">
          {currentRoomId !== null ? (
            <>
              <ChatHeader
                roomName={currentRoom.name}
                roomId={currentRoom.id}
                roomOwner={currentRoom.owner}
                leaveRoom={leaveRoom}
                deleteRoom={deleteRoom}
              />
              <ChatRoom roomId={currentRoomId} />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
              <p>Select a room to chat in</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Chat;
