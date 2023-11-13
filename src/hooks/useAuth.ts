import { useRecoilState } from "recoil";
import { authState } from "../recoil/atoms/authState";

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  // accessToken과 refreshToken을 받아 로컬 스토리지에 저장하고 상태 업데이트
  const setToken = (accessToken: string, refreshToken: string) => {
    return new Promise<void>((resolve) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setAuth({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
      resolve();
    });
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  };

  // 새로운 액세스 토큰 받아옴
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("https://fastcampus-chat.net/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (response.ok && data.accessToken) {
        setToken(data.accessToken, refreshToken);
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      // 에러 핸들링 추가해야함.
    }
  };

  return { auth, setToken, logout, refreshAccessToken };
};