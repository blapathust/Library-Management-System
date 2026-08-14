// Trang Login 
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  // State lưu role hiện tại, mặc định là "user"
  const [role, setRole] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { isAuthenticated, role: authRole, isLoading: authLoading } = useAuth();

  // Kiểm tra role hiện tại có phải là admin không
  const isAdmin = role === "admin";

  // If user is already authenticated, redirect them away from login
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const target = (authRole === 'ADMIN' || authRole === 'STAFF') ? '/admin' : '/user';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, authLoading, authRole, navigate]);

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const success = await authService.login(username, password);
      
      if (success) {
        // Full page reload to the target route.
        // This completely avoids React state timing issues —
        // AuthProvider re-initializes cleanly on the fresh page load.
        window.location.href = isAdmin ? "/admin" : "/user";
        return; // Don't setLoading(false), page is reloading
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Wrapper chính với nền gradient khác nhau tùy theo role
    <div className={`min-h-screen flex items-center justify-center ${isAdmin
      ? "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400"
      : "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
      } p-4`}>
      {/* Container form với background trắng, bo góc và bóng */}
      <div className="bg-white pt-20 pb-8 px-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">

        {/* Tab chuyển đổi giữa User và Admin ở phía trên cùng, dùng button */}
        <div className="absolute top-0 left-0 right-0 flex rounded-t-2xl overflow-hidden">
          <button
            onClick={() => setRole("user")} // Chọn role user khi click
            className={`w-1/2 py-3 text-sm font-semibold transition duration-300 ${!isAdmin
              ? "bg-blue-500 text-white" // Tab User active có nền xanh dương
              : "bg-white text-blue-600 hover:bg-blue-100" // Tab User inactive
              }`}
          >
            User
          </button>
          <button
            onClick={() => setRole("admin")} // Chọn role admin khi click
            className={`w-1/2 py-3 text-sm font-semibold transition duration-300 ${isAdmin
              ? "bg-purple-600 text-white" // Tab Admin active có nền tím đậm
              : "bg-white text-purple-600 hover:bg-purple-100" // Tab Admin inactive
              }`}
          >
            Admin
          </button>
        </div>

        <h2 className={`text-3xl font-bold text-center mb-6 ${isAdmin ? "text-purple-700" : "text-blue-700"
          }`}>
          {isAdmin ? "Admin Login" : "Login to Library Management System"}
        </h2>

        {/* Display error message if any */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Form đăng nhập với 2 input username và password */}
        <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
          <div>
            {/* Label cho trường username */}
            <label className="block mb-1 text-gray-700 font-medium" htmlFor="username">
              Username
            </label>
            {/* Input username với placeholder và viền focus thay đổi màu theo role */}
            <input
              id="username"
              type="text"
              placeholder={isAdmin ? "Enter your admin username" : "Enter your username"}
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 ${isAdmin ? "focus:ring-purple-400" : "focus:ring-blue-400"
                } focus:outline-none`}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            {/* Label cho trường password */}
            <label className="block mb-1 text-gray-700 font-medium" htmlFor="password">
              Password
            </label>
            {/* Input password với placeholder và viền focus thay đổi màu theo role */}
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 ${isAdmin ? "focus:ring-purple-400" : "focus:ring-blue-400"
                } focus:outline-none`}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Nút submit với màu nền và hiệu ứng hover thay đổi theo role */}
          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition duration-300 font-semibold ${isAdmin
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : (isAdmin ? "Login as Admin" : "Login as User")}
          </button>
        </form>

        {/* Nếu role là user thì hiển thị link đăng ký */}
        {!isAdmin && (
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            {/* Link chuyển hướng sang trang đăng ký */}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
