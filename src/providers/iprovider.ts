export interface IProvider<T> {
  readonly table: string
  readonly instance: any
  readonly readObject: (key: string) => T
  readonly writeObject: (ref: {key: string, value: T}) => void
}
