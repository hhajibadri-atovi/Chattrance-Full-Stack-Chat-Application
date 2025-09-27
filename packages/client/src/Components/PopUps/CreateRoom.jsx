import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiEye, FiEyeOff } from "react-icons/fi";

import { API_ROUTES } from "chattrance-shared";

import "./CreateRoom.css";

const CreateRoomPopUp = ({ onClose, addRoom }) => {

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    password: "",
    passwordCheck: "",
  });

  const handleForm = (e) => {
    e.preventDefault();
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleCreateRoom = async () => {
    const res = await fetch(API_ROUTES.CHAT.CREATE_ROOMS, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: form.name, password: form.password }),
    });
    const serverData = await res.json();
    if (serverData.ok) {
      setMessage("Room created successfully");
      console.log(serverData);
      addRoom(serverData.data.roomData);
    } else {
      setMessage(serverData.error);
    }
  }

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="flex flex-col items-center gap-3">
          <span>Room Name</span>
          <input
            className="outline-none rounded-md p-1 border-2 focus:border-blue-400 focus:bg-slate-500"
            type="text"
            name="name"
            value={form.username}
            onChange={handleForm}
          />
          <span>Room Password</span>
          <input
            className="outline-none rounded-md p-1 border-2 focus:border-blue-400 focus:bg-slate-500"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleForm}
          />
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-blue-500 hover:text-blue-700"
            >
              {showPassword ? <FiEye size={24} /> : <FiEyeOff size={24} />}
            </button>
            <span className="ml-2">Show Password</span>
          </div>
          <button
            onClick={handleCreateRoom}
            className="mt-2 px-10 py-2 text-2xm rounded-md bg-gradient-to-r from-green-500 to-green-400 to-100% hover:from-purple-500 hover:to-yellow-500 text-white">
            Create Room
          </button>
          <button
            className="text-blue-400 mt-2 underline hover:underline"
            onClick={onClose}>Close Button</button>

          <p className="text-red-600 font-semibold">
            {message ? message : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPopUp;