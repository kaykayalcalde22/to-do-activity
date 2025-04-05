import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Conditional rendering for error message
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    await axios
      .post("http://localhost:3000/check-user", { username, password })
      .then((response) => {
        if (response.data.exist) {
          setShowError(false);
          navigate("/todo");
        } else {
          setShowError(true);
        }
      });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 to-black p-5">
      <div className="w-full max-w-md bg-gray-800 shadow-2xl rounded-3xl p-8 border-4 border-red-600 text-white">
        <h1 className="text-5xl text-center font-bold text-red-500 drop-shadow-lg mb-6">
          💈Barber Login💈
        </h1>
  
        {showError && (
          <div className="bg-red-600 text-white p-3 rounded-lg font-medium text-center">
            ❌ Incorrect username or password
          </div>
        )}
  
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-red-400">Username</label>
            <input
              type="text"
              className="mt-1 p-3 rounded-lg bg-gray-700 text-white outline-none border-2 border-red-500 focus:ring-2 focus:ring-red-400"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
  
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-red-400">Password</label>
            <input
              type="password"
              className="mt-1 p-3 rounded-lg bg-gray-700 text-white outline-none border-2 border-red-500 focus:ring-2 focus:ring-red-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
  
          <button
            type="button"
            onClick={handleLogin}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-xl rounded-lg shadow-md transition-all"
          >
            💈 LOGIN 💈
          </button>
        </div>
      </div>
    </div>
  );
  }
  
  export default App;
  