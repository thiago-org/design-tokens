
interface RootObject {
  primary: Primary;
  black: Primary;
  white: Primary;
  gray: Gray;
}
interface Gray {
  '200': _200;
}
interface _200 {
  value: string;
  type: string;
  description: string;
}
interface Primary {
  value: string;
  type: string;
}