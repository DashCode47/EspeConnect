export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly value: L;
  constructor(value: L) {
    this.value = value;
  }
  isLeft(): this is Left<L, R> {
    return true;
  }
  isRight(): this is Right<L, R> {
    return false;
  }
  fold<S>(onLeft: (l: L) => S, onRight: (r: R) => S): S {
    return onLeft(this.value);
  }
}

export class Right<L, R> {
  readonly value: R;
  constructor(value: R) {
    this.value = value;
  }
  isLeft(): this is Left<L, R> {
    return false;
  }
  isRight(): this is Right<L, R> {
    return true;
  }
  fold<S>(onLeft: (l: L) => S, onRight: (r: R) => S): S {
    return onRight(this.value);
  }
}

export const left = <L, R>(l: L): Either<L, R> => new Left(l);
export const right = <L, R>(r: R): Either<L, R> => new Right(r);
