import {
  Button,
  Card,
  Center,
  Flex,
  Grid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import GameChat from "../../components/Game/GameChat";
import GameStart from "../../components/Game/GameStart";
import Timer from "../../components/Game/Timer";
import useFetch from "../../hooks/useFetch";
import useFireFetch from "../../hooks/useFireFetch";
import { authState } from "../../recoil/atoms/authState";
import { userState } from "../../recoil/atoms/userState";
import connect from "../../socket/socket";

interface ProfileCardProps {
  userId: string;
  speaking: string;
  status: string;
}

interface GameInfo {
  category: string;
  keyword: string;
  liar: string;
  users: string[];
  status: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  userId,
  speaking,
  status,
}) => {
  return (
    <Card
      background={status === "게임중" && userId === speaking ? "#3182ce" : ""}
      color={status === "게임중" && userId === speaking ? "#fff" : "#000"}
      w="200px"
      h="160px"
      justify="center"
      mb="20px"
    >
      <Flex direction="column" align="center">
        {status === "게임중" && userId === speaking && (
          <Text fontSize="0.95rem" mt="-0.5rem">
            키워드에 대해 설명해주세요
          </Text>
        )}
        <Text fontWeight="bold">{userId}</Text>
      </Flex>
    </Card>
  );
};

const Game = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useRecoilValue(authState);

  if (!isAuthenticated) {
    navigate("/");
  }

  const user = useRecoilValue(userState);

  const queryString = window.location.search;
  const searchParams = new URLSearchParams(queryString);
  const gameId = searchParams.get("gameId");
  // 게임 진행 상황 상태
  const [current, setCurrent] = useState("");
  // 현재 발언자 상태
  const [speaking, setSpeaking] = useState("qwer1234");
  // 개별 발언 종료 확인을 위한 상태
  const [num, setNum] = useState(0);

  const fireFetch = useFireFetch();

  const gameData = fireFetch.useGetSome("game", "id", gameId as string);
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  // 게임 소켓 서버 연결
  const socket = connect(gameId as string);
  // 메인 소켓 서버 연결 (메인페이지 상태 변경 통신)
  const socketMain = connect("9984747e-389a-4aef-9a8f-968dc86a44e4");

  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [liar, setLiar] = useState("");

  useEffect(() => {
    setSpeaking(users[0]);
  }, [users]);

  useEffect(() => {
    if (num !== 0 && num === users.length) {
      setCurrent("자유발언");
    }
  }, [num, users]);

  useEffect(() => {
    if (gameData.data && gameData.data.length > 0) {
      setStatus(gameData.data[0].status);
      setUsers(gameData.data?.[0]?.users);
    } else {
      setUsers([]);
    }
  }, [gameData.data]);

  // 게임 나가기 api 선언 (호출 X)
  const leave = useFetch({
    url: "https://fastcampus-chat.net/chat/leave",
    method: "PATCH",
    data: {
      chatId: gameId,
    },
    start: false,
  });

  const leaveGame = () => {
    leave.refresh();
    const newUsers = users.filter((value) => value !== user.id);
    socketMain.emit("message-to-server", `${user.id}:${gameId}:)*^$@`);
    fireFetch.updateData("game", gameId as string, {
      users: newUsers,
    });
    navigate("/main");
  };

  const handleGameInfoReceived = (gameInfo: GameInfo) => {
    setCategory(gameInfo.category);
    setKeyword(gameInfo.keyword);
    setLiar(gameInfo.liar);
    setUsers(gameInfo.users);
    setStatus(gameInfo.status);

    if (current === "게임종료") {
      setCurrent("");
      setNum(0);
    } else {
      setCurrent("개별발언");
    }
    setSpeaking(users[0]);
  };

  if (gameData.data.length === 0) {
    return <p>Loading...</p>;
  }

  if (!gameId) {
    return null;
  }

  return (
    <Flex direction="column" px="100px">
      {current === "자유발언" && (
        <Timer current={current} setCurrent={setCurrent} />
      )}

      <Center>
        <Grid
          templateColumns="200px minmax(500px,1000px) 200px"
          templateRows="50px 1fr"
          gap="20px"
          mt="50px"
          maxW="1600px"
        >
          <GridItem>
            <Button
              w="200px"
              h="100%"
              mr="20px"
              colorScheme="facebook"
              onClick={leaveGame}
            >
              뒤로가기
            </Button>
          </GridItem>
          <GridItem>
            <Card h="100%" justifyContent="center">
              <Center fontWeight="bold">
                {gameData.data[0].bg} {gameData.data[0].name}
              </Center>
            </Card>
          </GridItem>
          <GridItem>
            <GameStart
              gameId={gameId}
              socket={socket}
              socketMain={socketMain}
              status={status}
              users={users}
              host={gameData.data[0].host}
              current={current}
              setCurrent={setCurrent}
            />
          </GridItem>
          <GridItem>
            {users?.slice(0, 3).map((user, index) => {
              return (
                <ProfileCard
                  key={index}
                  userId={user}
                  speaking={speaking}
                  status={status}
                ></ProfileCard>
              );
            })}
          </GridItem>
          <GridItem>
            <Card h="40px" justifyContent="center" mb="20px">
              <Center fontWeight="bold">
                {status === "게임중" ? (
                  <>
                    <p>주제는 {category} 입니다. &nbsp;</p>

                    {liar === user.id ? (
                      <p>당신은 Liar 입니다. </p>
                    ) : (
                      <p>키워드는 {keyword} 입니다.</p>
                    )}
                  </>
                ) : (
                  <p>게임을 시작해주세요.</p>
                )}
              </Center>
            </Card>
            <GameChat
              socket={socket}
              gameData={gameData.data[0]}
              current={current}
              setCurrent={setCurrent}
              speaking={speaking}
              num={num}
              player={users}
              setPlayer={setUsers}
              setNum={setNum}
              setSpeaking={setSpeaking}
              onGameInfoReceived={handleGameInfoReceived}
              liar={liar}
            />
          </GridItem>
          <GridItem>
            <GridItem>
              {users?.slice(3, 6).map((user, index) => {
                return (
                  <ProfileCard
                    key={index}
                    userId={user}
                    speaking={speaking}
                    status={status}
                  ></ProfileCard>
                );
              })}
            </GridItem>
          </GridItem>
        </Grid>
      </Center>
    </Flex>
  );
};

export default Game;
