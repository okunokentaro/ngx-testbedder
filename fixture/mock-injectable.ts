export const Injectable = () => {
  return (cls: any) => {
    return cls
  }
}

const OtherDecorator = () => {
  return (cls: any) => {
    return cls
  }
}
