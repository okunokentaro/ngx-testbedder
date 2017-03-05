function Injectable() {
  return (cls: any) => {
    return cls
  };
}

function OtherDecorator() {
  return (cls: any) => {
    return cls
  };
}

@Injectable()
@OtherDecorator()
class CCCC {

  methodA(): string {
    return 'string'
  }

}

class DDDD {

  methodA(): string {
    return 'string'
  }

}
