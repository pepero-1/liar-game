import { useEffect, useState } from "react";
import Keyword from "../../components/Game/Keyword";
import useFireFetch from "../../hooks/useFireFetch";

const Game = () => {
  const queryString = window.location.search;
  const searchParams = new URLSearchParams(queryString);
  const gameId = searchParams.get("gameId");

  const fireFetch = useFireFetch();
  const gameData = fireFetch.useGetSome("game", "id", gameId as string);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (gameData.data && gameData.data.length > 0) {
      setStatus(gameData.data[0].status);
    }
  }, [gameData.data]);

  // status 업데이트 함수
  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    if (gameId) {
      fireFetch.updateData("game", gameId, { status: newStatus });
    }
  };

  console.log(gameData.data);

  return (
    <div>
      <Keyword status={status} updateStatus={updateStatus} />
    </div>
  );
};

export default Game;
