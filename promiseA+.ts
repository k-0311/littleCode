interface PromiseConstructor {
  readonly prototype: Promise<any>
  new <T>(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ): Promise<T>;
}
