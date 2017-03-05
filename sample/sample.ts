function Injectable() {
  return (cls: any) => {
    return cls
  };
}

@Injectable()
class C {

  methodA(): string {
    return 'string'
  }

}
