import axios from "axios";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { authState } from "../recoil/atoms/authState";

interface BaseProps {
  url: string;
  start: boolean;
}
type GetProps = {
  method: "GET";
  data?: never;
};
type PostProps = {
  method: "POST" | "PATCH";
  data: object;
};

type ConditionalProps = GetProps | PostProps;
type Props = BaseProps & ConditionalProps;

interface Return {
  result: any;
  loading: boolean;
  statusCode: number;
  refresh: () => void;
  error: any;
}

const useFetch = ({ url, method, data, start }: Props): Return => {
  const [result, setResult] = useState<object>();
  const [loading, setLoading] = useState(false);
  const [statusCode, setCode] = useState(-1);
  const [error, setError] = useState<any>({});
  const auth = useRecoilValue(authState);

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);

    let headers;
    if (
      url === "https://fastcampus-chat.net/signup" ||
      url === "https://fastcampus-chat.net/login" ||
      url === "https://fastcampus-chat.net/check/id"
    ) {
      headers = {
        "content-type": "application/json",
        serverId: import.meta.env.VITE_APP_SERVER_ID,
      };
    } else {
      headers = {
        "content-type": "application/json",
        serverId: import.meta.env.VITE_APP_SERVER_ID,
        Authorization: `Bearer ${auth.accessToken}`,
      };
    }

    if (method === "GET") {
      try {
        const response = await axios.get(url, {
          headers: headers,
        });

        setCode(response.status);
        setResult(response.data);
      } catch (error) {
        setError(error);
        setResult({});
      }

      setLoading(false);
    } else if (method === "POST") {
      try {
        const response = await axios.post(url, data, {
          headers: headers,
        });
        setCode(response.status);
        setResult(response.data);
      } catch (error) {
        setError(error);
        setResult({});
      }

      setLoading(false);
    } else if (method === "PATCH") {
      try {
        const response = await axios.patch(url, data, {
          headers: headers,
        });

        setCode(response.status);
        setResult(response.data);
      } catch (error) {
        setError(error);
        setResult({});
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    if (start) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, url]);

  const refresh = () => {
    fetchData();
  };

  return { result, loading, statusCode, refresh, error };
};

export default useFetch;
