type TryLock = (method: string) => TryRelease;

type TryRelease = boolean | (() => void);
