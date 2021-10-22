import mcache from "memory-cache";
import MemCacheKeys from "../constants/MemCacheKeys";

const setCache = ({
  key,
  payload,
  duration = 10 * 1000,
}: {
  key: string;
  payload: any;
  duration?: number;
}) => {
  mcache.put(key, payload, duration);
};

const getCache = (key: string) => {
  return mcache.get(key);
};

const removeCache = (key: string) => {
  mcache.del(key);
};

const clearCache = () => {
  mcache.clear();
};

export { setCache, getCache, removeCache, clearCache };
