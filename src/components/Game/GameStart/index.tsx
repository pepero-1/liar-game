import { Button } from "@chakra-ui/react";
import data from "../../../data/category.json";
import { useRecoilValue } from "recoil";
import { userState } from "../../../recoil/atoms/userState";
import { Socket } from "../../Main/CreateGameModal";
import useFireFetch from "../../../hooks/useFireFetch";

interface GameStartProps {
  gameId: string;
  socket: Socket;
  socketMain: Socket;
  status: string;
  users: string[];
  host: string;
  current: string;
  setCurrent: React.Dispatch<React.SetStateAction<string>>;
}

interface UserWithSort {
  value: string;
  sort: number;
}

const GameStart: React.FC<GameStartProps> = ({
  gameId,
  socket,
  socketMain,
  status,
  users,
  host,
  setCurrent,
}) => {
  const user = useRecoilValue(userState);

  const categories = data.CategoryList;

  const fireFetch = useFireFetch();

  // 랜덤 숫자 계산 함수
  const getRandNum = (length: number): number => {
    return Math.floor(Math.random() * length);
  };

  // 게임 시작 함수
  const handleStart = async () => {
    fireFetch.updateData("game", gameId as string, { status: "게임중" });

    const selectedCategory = categories[getRandNum(categories.length)];
    const ranKeyword =
      selectedCategory.keyword[getRandNum(selectedCategory.keyword.length)];
    const ranLiar = users[getRandNum(users.length)];

    // 유저 순서 랜덤으로 섞기
    const newUsers: string[] = users
      .map(
        (userId: string): UserWithSort => ({
          value: userId, // 실제 유저 ID
          sort: Math.random(), // 랜덤 정렬을 위한 값
        }),
      )
      .sort((a: UserWithSort, b: UserWithSort): number => a.sort - b.sort)
      .map(({ value }: UserWithSort): string => value);

    // 게임 정보를 모든 클라이언트에게 전송
    const gameInfo = JSON.stringify({
      category: selectedCategory.category,
      keyword: ranKeyword,
      liar: ranLiar,
      users: newUsers,
      status: "게임중",
    });

    // 모든 클라이언트에게 게임 정보를 포함하는 이벤트 전송
    socket.emit("message-to-server", gameInfo + "~!@##");
    socketMain.emit("message-to-server", gameId + ":" + "~!@##");
    // setShowStartModal(true);
  };

  // 게임 종료
  const handleEnd = () => {
    const gameInfo = JSON.stringify({
      category: "",
      keyword: "",
      liar: "",
      users: users,
      status: "대기중",
    });

    socket.emit("message-to-server", gameInfo + "~##@!");
    fireFetch.updateData("game", gameId as string, { votedFor: [] });
    fireFetch.updateData("game", gameId as string, { status: "대기중" });

    setCurrent("게임종료");

    socketMain.emit("message-to-server", gameId + ":" + "~!a%2@##");
    // setShowStartModal(false);
  };

  return (
    <>
      {status === "대기중" ? (
        <Button
          w="200px"
          h="100%"
          mr="20px"
          colorScheme="facebook"
          onClick={handleStart}
          isDisabled={host !== user.id}
        >
          게임시작
        </Button>
      ) : (
        <Button
          w="200px"
          h="100%"
          mr="20px"
          onClick={handleEnd}
          isDisabled={host !== user.id}
        >
          게임 종료
        </Button>
      )}
    </>
  );
};

export default GameStart;
