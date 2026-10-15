import Axios, { AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

import { env } from "../env";

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let logoutFn: null | (() => void) = null;

export const setLogoutHandler = (fn: () => void) => {
  logoutFn = fn;
};

let isLoggingOut = false;
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.EXPO_PUBLIC_BACKEND,
});

const REFRESH_INSTANCE = Axios.create({
  baseURL: env.EXPO_PUBLIC_BACKEND,
});

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  try {
    if (isLoggingOut) {
      return Promise.reject({ message: "Request blocked: logging out" });
    }
    const accessToken = await SecureStore.getItemAsync("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const url = config?.url;
    const method = config?.method?.toUpperCase();
    const errorMessage = error.response?.data?.message || error.message;

    console.error("[AXIOS ERROR]", {
      method,
      url,
      status,
      errorMessage,
      timestamp: new Date().toISOString(),
    });

    if (status === 401 && !config._retry && !isLoggingOut) {
      console.log("Attempting to refresh token...");
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers["Authorization"] = "Bearer " + token;
            return AXIOS_INSTANCE(config);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await REFRESH_INSTANCE.post("/auth/refresh-token", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data;

        await SecureStore.setItemAsync("accessToken", accessToken);
        if (newRefreshToken) {
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);
        }

        AXIOS_INSTANCE.defaults.headers.common["Authorization"] =
          "Bearer " + accessToken;

        processQueue(null, accessToken);

        config.headers["Authorization"] = "Bearer " + accessToken;
        return AXIOS_INSTANCE(config);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (!isLoggingOut) {
          isLoggingOut = true;
          await logoutFn?.();
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          setTimeout(() => {
            isLoggingOut = false;
          }, 2000);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      return Promise.reject(error);
    }
  },
);
